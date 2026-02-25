import { Request } from 'express'
import { Types } from 'mongoose'
import { Album, AlbumDocument } from '../models/album.model'
import { Artist, ArtistDocument } from '../models/artist.model'
import { Genre, GenreDocument } from '../models/genre.model'
import { Period, PeriodDocument } from '../models/period.model'
import { ListRequestConfig } from '../types/pagination'
import { AlbumRepository, AlbumShape, AlbumTrack } from '../types/album'
import { CloudEntity } from '../types/cloud'
import { getCloudApi } from '..'
import Parser from '../utils/Parser'
import Validator from '../utils/Validator'
import FileFilter from '../utils/FileFilter'
import TrackService from './TrackService'
import CategoryService from './CategoryService'
import CollectionService from './CollectionService'
import CompilationService from './CompilationService'
import AlbumViewFactory from '../views/AlbumViewFactory'
import PaginationViewFactory from '../views/PaginationViewFactory'
import { releaseSubfolder } from '../globals'

export default class AlbumService {
  #root = 'MelodyMap/Collection'

  constructor(
    private albumRepository: AlbumRepository,
    private categoryService: CategoryService,
    private collectionService: CollectionService,
    private compilationService: CompilationService,
    private trackService: TrackService
  ) {}

  async createAlbums(albums: CloudEntity[]) {
    const invalidFolders: Record<string, string>[] = []

    const albumShapes = await Promise.all(albums.map(async (album) => {
      if (!Validator.isAlbumFolderNameValid(album.title)) {
        invalidFolders.push({
          album: album.title,
          cloud: album.cloudURL,
          reason: 'invalid_folder_name'
        })
        return Promise.resolve(null)
      } else {
        return await this.createAlbumShape(album)
      }
    }))

    const { validShapes, invalidShapes } = this.validateAlbumShapes(albumShapes)

    await this.preCreateCategories(validShapes)

    const savedAlbums = await Promise.all(validShapes.map(async (shape) => (
      await this.createAlbum(shape)
    )))

    invalidFolders.push(...invalidShapes)

    return {
      added: savedAlbums,
      invalid: invalidFolders.length > 0 ? invalidFolders : [],
      updated: [],
      deleted: []
    }
  }

  async preCreateCategories(shapes: AlbumShape[]) {
    const uniqueArtists = new Set<string>()
    const uniqueGenres = new Set<string>()
    const uniquePeriods = new Set<string>()

    shapes.forEach((shape) => {
      shape.artists.forEach((a) => uniqueArtists.add(a))
      uniqueGenres.add(shape.genre)
      uniquePeriods.add(shape.period)
    })

    for (const artist of uniqueArtists) {
      await this.categoryService.createCategory<ArtistDocument>(Artist, artist)
    }

    for (const genre of uniqueGenres) {
      await this.categoryService.createCategory<GenreDocument>(Genre, genre)
    }

    for (const period of uniquePeriods) {
      await this.categoryService.createCategory<PeriodDocument>(Period, period)
    }
  }

  async updateAlbumsClouds(albums: AlbumDocument[]) {
    const updatedAlbums = await this.albumRepository.updateAlbumsClouds(albums)
    await Promise.all(albums.map((album) =>
      this.trackService.updateTracksCloudURLByAlbum(album._id, album.cloudURL)
    ))
    return updatedAlbums
  }

  async createAlbumShape(album: CloudEntity): Promise<AlbumShape> {
    if (!album.path) {
      throw new Error('Album path is not defined')
    }

    const cloudAPI = getCloudApi(album.cloudURL)
    const albumPath = `${this.#root}/${album.path}`
    
    const albumContent = await cloudAPI.getFolderContent({
      path: encodeURIComponent(albumPath),
      query: 'limit=1000'
    })
    
    const folders = albumContent.items.filter((item) => 
      item.type === 'dir' || !item.mimeType
    )

    const files = albumContent.items.filter((item) => 
      item.type !== 'dir' && !!item.mimeType
    )
    
    const rootTracks = FileFilter.fileFilter(
      files.map((track) => ({
        ...track,
        path: encodeURIComponent(`${albumPath}/${track.path}`)
      })),
      'audioMimeTypes'
    )
    
    let allTracks: AlbumTrack[] = []
    
    if (rootTracks.length > 0) {
      allTracks = rootTracks.map((track) => ({ track }))
    } else {
      const releaseFolders = folders.filter((folder) => 
        folder.title.startsWith(releaseSubfolder)
      )
      
      for (const releaseFolder of releaseFolders) {
        const releaseName = releaseFolder.title.substring(releaseSubfolder.length).trim()
        const releaseFolderPath = `${albumPath}/${releaseFolder.title}`
        
        const releaseContent = await cloudAPI.getFolderContent({
          path: encodeURIComponent(releaseFolderPath),
          fileType: 'audio',
          query: 'limit=1000'
        })
        
        const releaseTracks = FileFilter.fileFilter(
          releaseContent.items.map((track) => ({
            ...track,
            path: encodeURIComponent(`${releaseFolderPath}/${track.path}`)
          })),
          'audioMimeTypes'
        )
        
        allTracks.push(...releaseTracks.map((track) => ({
          track,
          release: releaseName
        })))
      }
    }
    
    return {
      folderName: album.title,
      cloudURL: album.cloudURL,
      path: encodeURIComponent(albumPath),
      title: Parser.parseAlbumTitle(album.title),
      artists: Parser.parseArtistNames(album.title),
      genre: Parser.parseAlbumGenre(album.title),
      period: Parser.getAlbumReleaseYear(album.title),
      tracks: allTracks
    }
  }

  validateAlbumShapes(shapes: Array<AlbumShape | null>) {
    return shapes.reduce<{
      validShapes: AlbumShape[],
      invalidShapes: Record<string, string>[]
    }>((acc, next) => {
      if (!next) return acc

      if (!next.tracks?.length) {
        acc.invalidShapes.push({
          album: next.title,
          cloud: next.cloudURL,
          reason: 'no_tracks'
        })
      } else if (!next.tracks.every(({ track }) => Validator.isTrackFilenameValid(track.title))) {
        acc.invalidShapes.push({
          album: next.title,
          cloud: next.cloudURL,
          reason: 'invalid_tracks_names'
        })
      } else {
        acc.validShapes.push(next)
      }
      return acc
    }, { validShapes: [], invalidShapes: [] })
  }

  async createAlbum(shape: AlbumShape) {
    const { artists: _artists, tracks: _tracks, ...albumFields } = shape
    const newAlbum = new Album({ ...albumFields, artists: [], tracks: [] })
    const newArtists = (await Promise.all(
      shape.artists.map((name) => this.categoryService.createCategory<ArtistDocument>(Artist, name, newAlbum._id))
    )).filter((a): a is NonNullable<typeof a> => !!a)
    const newGenre = await this.categoryService.createCategory<GenreDocument>(Genre, shape.genre, newAlbum._id)
    const newPeriod = await this.categoryService.createCategory<PeriodDocument>(Period, shape.period, newAlbum._id)

    const primaryArtist = newArtists[0]
    if (primaryArtist && newGenre && newPeriod) {
      const albumTracks = await Promise.all(shape.tracks.map(async ({ track, release }) => (
        await this.trackService.createTrack({
          track,
          release,
          albumId: newAlbum._id,
          artistId: primaryArtist._id,
          genreId: newGenre._id,
          periodId: newPeriod._id,
          cloudURL: shape.cloudURL
        })
      )))

      await this.albumRepository.saveNewAlbum(newAlbum, {
        artists: newArtists.map((a) => a._id),
        genre: newGenre._id,
        period: newPeriod._id,
        tracks: albumTracks.map((t) => t._id).filter((id): id is Types.ObjectId => id != null)
      })

      return {
        ...newAlbum.toObject(),
        artists: newArtists,
        genre: newGenre,
        period: newPeriod
      }
    }

    throw new Error('Unable to create album')
  }

  async getAlbumDocs() {
    return await this.albumRepository.fetchAlbumDocs()
  }

  async removeAlbums(albumsIds: Types.ObjectId[]) {
    const result = await Promise.all(albumsIds.map(async (id) => (
      await this.removeAlbum(id)
    )))

    if (albumsIds.length) {
      await this.categoryService.cleanupEmptyCategories()
    }

    return result
  }

  async removeAlbum(_id: Types.ObjectId | string) {
    const album = await this.albumRepository.getAlbum(_id)
    const preparedAlbum = AlbumViewFactory.createAlbumPageView(album)
    const collections = preparedAlbum.inCollections?.map(({ _id }) => _id)
    const compilations = preparedAlbum.tracks.reduce<Map<string, string[]>>((acc, next) => {
      const compilationsIds = next.inCompilations?.map(({ _id }) => _id)
      if (compilationsIds?.length) {
        compilationsIds.forEach((compilationId) => {
          const key = compilationId.toString()
          acc.has(key)
            ? acc.get(key)?.push(next._id)
            : acc.set(key, [next._id])
        })
      }
      return acc
    }, new Map())

    const artistIds = [...new Set(
      (album.artists ?? [])
        .map((a) => (typeof a === 'object' && a && '_id' in a ? (a as { _id: Types.ObjectId })._id : a))
        .filter(Boolean) as Types.ObjectId[]
    )]

    for (const artistId of artistIds) {
      const updatedArtist = await this.categoryService.cleanAlbums(Artist, artistId, _id)
      if (
        updatedArtist
        && !updatedArtist.albums?.length
      ) {
        await this.categoryService.removeCategory(Artist, updatedArtist._id.toString())
      }
    }

    if (album.genre) {
      const updatedGenre = await this.categoryService.cleanAlbums(Genre, album.genre._id, _id)
      if (updatedGenre && !updatedGenre.albums?.length) {
        await this.categoryService.removeCategory(Genre, updatedGenre._id.toString())
      }
    }

    if (album.period) {
      const updatedPeriod = await this.categoryService.cleanAlbums(Period, album.period._id, _id)
      if (updatedPeriod && !updatedPeriod.albums?.length) {
        await this.categoryService.removeCategory(Period, updatedPeriod._id.toString())
      }
    }
    
    await this.trackService.removeTracks(album.tracks.map(({ _id }) => _id))

    if (collections?.length) {
      await this.collectionService.cleanCollection(collections, _id)
    }
    
    if (compilations.size > 0) {
      await this.compilationService.cleanCompilation(compilations)
    }

    await this.albumRepository.deleteAlbum(_id)
    return album
  }

  async getAlbum(_id: Types.ObjectId | string, withCover = true) {
    const album = await this.albumRepository.getAlbum(_id)

    if (!album) {
      throw new Error('Incorrect request options or album not found')
    }

    const cloudAPI = getCloudApi(album.cloudURL)
    const cover = withCover ? await cloudAPI.getFile({
      path: `${album.path}/cover.webp`,
      fileType: 'image'
    }) : undefined
    
    return AlbumViewFactory.createAlbumPageView(album, cover)
  }

  async getAlbums(req: Request<{}, {}, ListRequestConfig>) {
    const parsedQuery = Parser.parseNestedQuery<ListRequestConfig>(req)

    if (!!parsedQuery['isRandom']) {
      return await this.getAlbumsRandom(
        Number(parsedQuery['limit']),
        parsedQuery['filter']
      )
    }

    const dbList = await this.albumRepository.getAlbums(parsedQuery)

    if (!dbList) {
      throw new Error('Incorrect request options')
    }

    const { totalDocs, totalPages, page, docs } = dbList
    const pagination = PaginationViewFactory.create({ totalDocs, totalPages, page })
    const albums = await this.albumRepository.getCoveredAlbums(docs.filter((album) => !!album))

    return {
      pagination,
      docs: albums.map(({ album, cover }) => AlbumViewFactory.createAlbumItemView(album, cover))
    }
  }

  async getAlbumsRandom(limit: number, filter?: ListRequestConfig['filter']) {
    const dbList = await this.albumRepository.getAlbumsRandom(limit, filter)

    if (!dbList) {
      throw new Error('Incorrect request options')
    }

    const coveredAlbums = await this.albumRepository.getCoveredAlbums(
      dbList.reduce<AlbumDocument[]>((acc, next) => {
        if (!next) return acc
        acc.push({
          ...next,
          artists: Array.isArray(next.artists) ? next.artists : [],
          genre: Array.isArray(next.genre) ? next.genre[0] : next.genre,
          period: Array.isArray(next.period) ? next.period[0] : next.period
        } as AlbumDocument)
        return acc
      }, [])
    )

    const albums = await Promise.all(coveredAlbums)
    return {
      docs: albums.map(({ album, cover }) => (
        AlbumViewFactory.createAlbumItemView(album, cover)
      ))
    }
  }

  async getAlbumContent(req: Request) {
    return await this.albumRepository.getAlbumContent(req)
  }

  async updateAlbumNote(req: Request) {
    return await this.albumRepository.updateAlbumNote(req)
  }
}
