import { Request } from 'express'
import { Types } from 'mongoose'
import { Album, AlbumDocument } from '../models/album.model'
import { Artist, ArtistDocument } from '../models/artist.model'
import { Genre, GenreDocument } from '../models/genre.model'
import { Period, PeriodDocument } from '../models/period.model'
import { ListRequestConfig } from '../types/reqres.types'
import { AlbumRepository, AlbumShape } from '../types/album.types'
import { AlbumItemDTO, AlbumPageDTO } from '../dto/album.dto'
import { PaginationDTO } from '../dto/pagination.dto'
import { CloudEntityDTO } from '../types/cloud.types'
import { getCloudApi } from '..'
import utils from '../utils'
import collectionsServices from './collections.services'
import compilationsServices from './compilations.services'
import CategoryService from './CategoryService'
import TrackService from './TrackService'

export default class AlbumService {
  constructor(
    private albumRepository: AlbumRepository,
    private categoryService: CategoryService,
    private trackService: TrackService
  ) {}

  async createAlbums(albums: CloudEntityDTO[]) {
    const invalidFolders: Record<string, string>[] = []

    const albumShapes = await Promise.all(albums.map(async (album) => {
      if (!utils.isAlbumFolderNameValid(album.title)) {
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

    const savedAlbums = await Promise.all(validShapes.map(async (shape) => (
      await this.createAlbum(shape)
    )))

    invalidFolders.push(...invalidShapes)

    return {
      added: savedAlbums.length,
      invalid: invalidFolders.length > 0 ? invalidFolders : 0,
      updated: 0,
      deleted: 0
    }
  }

  async updateAlbums(albums: AlbumDocument[]) {
    return await this.albumRepository.updateAlbums(albums)
  }

  async createAlbumShape(album: CloudEntityDTO): Promise<AlbumShape> {
    const cloudAPI = getCloudApi(album.cloudURL)
    const albumContent = await cloudAPI.getFolderContent({
      id: album.id,
      path: album.path,
      fileType: 'audio'
    })
    
    return {
      folderName: album.title,
      cloudURL: album.cloudURL,
      cloudId: album.id,
      title: utils.parseAlbumTitle(album.title),
      artist: utils.parseArtistName(album.title),
      genre: utils.parseAlbumGenre(album.title),
      period: utils.getAlbumReleaseYear(album.title),
      tracks: utils.fileFilter(albumContent.items, utils.audioMimeTypes)
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
      } else if (!next.tracks.every(({ title }) => utils.isTrackFilenameValid(title))) {
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
    const newAlbum = new Album(shape)
    const newArtist = await this.categoryService.createCategory<ArtistDocument>(Artist, shape.artist, newAlbum._id)
    const newGenre = await this.categoryService.createCategory<GenreDocument>(Genre, shape.genre, newAlbum._id)
    const newPeriod = await this.categoryService.createCategory<PeriodDocument>(Period, shape.period, newAlbum._id)

    if (newArtist && newGenre && newPeriod) {
      const albumTracks = await Promise.all(shape.tracks.map(async (track) => (
        await this.trackService.createTrack({
          track,
          albumId: newAlbum._id,
          artistId: newArtist._id,
          genreId: newGenre._id,
          periodId: newPeriod._id,
          cloudURL: shape.cloudURL
        })
      )))

      return await this.albumRepository.saveNewAlbum(newAlbum, {
        artist: newArtist._id,
        genre: newGenre._id,
        period: newPeriod._id,
        tracks: albumTracks.map(({ _id }) => _id)
      })
    }

    throw new Error('Unable to create album')
  }

  async getAlbumDocs() {
    return await this.albumRepository.fetchAlbumDocs()
  }

  async removeAlbums(albumsIds: Types.ObjectId[]) {
    return await Promise.all(albumsIds.map(async (id) => (
      await this.removeAlbum(id)
    )))
  }

  async removeAlbum(_id: Types.ObjectId | string) {
    const album = await this.albumRepository.getAlbum(_id)
    const preparedAlbum = new AlbumPageDTO(album)
    const collections = preparedAlbum.inCollections?.map(({ _id }) => _id)
    const compilations = preparedAlbum.tracks.reduce<Map<string, string[]>>((acc, next) => {
      const compilationsIds = next.inCompilations?.map(({ _id }) => _id)
      if (compilationsIds?.length) {
        compilationsIds.forEach((key) => {
          acc.has(key.toString())
            ? acc.get(key.toString())?.push(next._id)
            : acc.set(key.toString(), [next._id])
        })
      }
      return acc
    }, new Map())

    await this.categoryService.cleanAlbums(Artist, album.artist._id, _id)
    await this.categoryService.cleanAlbums(Genre, album.genre._id, _id)
    await this.categoryService.cleanAlbums(Period, album.period._id, _id)
    await this.trackService.removeTracks(album.tracks.map(({ _id }) => _id))

    if (collections?.length) {
      await collectionsServices.cleanCollection(collections, _id)
    }
    
    if (compilations.size > 0) {
      await compilationsServices.cleanCompilation(compilations)
    }

    return await this.albumRepository.deleteAlbum(_id)
  }

  async getAlbum(_id: Types.ObjectId | string, withCover = true) {
    const album = await this.albumRepository.getAlbum(_id)

    if (!album) {
      throw new Error('Incorrect request options or album not found')
    }

    const cloudAPI = getCloudApi(album.cloudURL)
    const cover = withCover ? await cloudAPI.getFile({
      id: album.cloudId,
      path: `${album.folderName}/cover.webp`,
      fileType: 'image'
    }) : undefined
    
    return new AlbumPageDTO(album, cover)
  }

  async getAlbums(req: Request<{}, {}, ListRequestConfig>) {
    if (req.body.isRandom) {
      return await this.getAlbumsRandom(req.body.limit, req.body.filter)
    }

    const dbList = await this.albumRepository.getAlbums(req.body)

    if (!dbList) {
      throw new Error('Incorrect request options')
    }

    const { totalDocs, totalPages, page, docs } = dbList
    const pagination = new PaginationDTO({ totalDocs, totalPages, page })
    const albums = await this.getCoveredAlbums(docs.filter((album) => !!album))

    return { docs: albums, pagination }
  }

  async getAlbumsRandom(limit: number, filter?: ListRequestConfig['filter']) {
    const dbList = await this.albumRepository.getAlbumsRandom(limit, filter)

    if (!dbList) {
      throw new Error('Incorrect request options')
    }

    const coveredAlbums = await this.getCoveredAlbums(
      dbList.reduce<AlbumDocument[]>((acc, next) => {
        if (!next) return acc
        acc.push({
          ...next,
          artist: Array.isArray(next.artist) ? next.artist[0] : next.artist,
          genre: Array.isArray(next.genre) ? next.genre[0] : next.genre,
          period: Array.isArray(next.period) ? next.period[0] : next.period
        })
        return acc
      }, [])
    )

    const albums = await Promise.all(coveredAlbums)
    return { docs: albums }
  }

  async getCoveredAlbums(docs: AlbumDocument[]) {
    return await Promise.all(docs.map(async (album) => {
      const cloudAPI = getCloudApi(album.cloudURL)
      const cover = await cloudAPI.getFile({
        id: album.cloudId,
        path: `${album.folderName}/cover.webp`,
        fileType: 'image'
      })
      return new AlbumItemDTO(album, cover || undefined)
    }))
  }
}
