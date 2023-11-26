import { Request } from 'express'
import { Types, PipelineStage } from 'mongoose'
import { Album } from '../models/album.model'
import { Artist } from '../models/artist.model'
import { Genre } from '../models/genre.model'
import { Period } from '../models/period.model'
import { AlbumResponse, AlbumShape } from '../types/album.types'
import { PaginationOptions, Populate } from '../types/ReqRes'
import { AlbumItemDTO, AlbumSingleDTO } from '../dtos/album.dto'
import { PaginationDTO } from '../dtos/pagination.dto'
import { TrackDTO } from '../dtos/track.dto'
import { CloudEntityDTO } from '../dtos/cloud.dto'
import { Cloud } from '../'
import utils from '../utils'
import categoriesServices from './categories.services'
import tracksServices from './tracks.services'
import collectionsServices from './collections.services'
import playlistsServices from './playlists.services'

class AlbumsServices {
  async getAlbumDocs() {
    return await Album.find({}, { folderName: true, tracks: true })
  }

  async createShape(album: CloudEntityDTO): Promise<AlbumShape> {
    const albumContent = await Cloud.getFolderContent(
      `${process.env['COLLECTION_ROOT']}/Collection/${album.path}&limit=100`
    ) || { items: [] }
    
    return {
      folderName: album.title,
      title: utils.parseAlbumTitle(album.title),
      artist: utils.parseArtistName(album.title),
      genre: utils.parseAlbumGenre(album.title),
      period: utils.getAlbumReleaseYear(album.title),
      tracks: utils.fileFilter(albumContent.items, utils.audioMimeTypes)
    }
  }

  async createAlbum(shape: AlbumShape) {
    const newAlbum = new Album(shape)
    const newArtist = await categoriesServices.create(Artist, shape.artist, newAlbum._id)
    const newGenre = await categoriesServices.create(Genre, shape.genre, newAlbum._id)
    const newPeriod = await categoriesServices.create(Period, shape.period, newAlbum._id)

    if (newArtist && newGenre && newPeriod) {
      const albumTracks = await Promise.all(shape.tracks.map(async (track) => (
        await tracksServices.create(track, newAlbum._id, newArtist._id)
      )))
      const dateOfCreation = new Date()

      newAlbum.$set({ artist: newArtist._id })
      newAlbum.$set({ genre: newGenre._id })
      newAlbum.$set({ period: newPeriod._id })
      newAlbum.$set({ created: dateOfCreation })
      newAlbum.$set({ modified: dateOfCreation })
      newAlbum.$set({ tracks: albumTracks.map(({ _id }) => _id) })

      return await newAlbum.save()
    }
    return false
  }

  async removeAlbum(_id: Types.ObjectId | string) {
    const album = await this.getSingleAlbum(_id)
    const collections = album.inCollections?.map(({ _id }) => _id)
    const playlists = album.tracks.reduce<Map<string, string[]>>((acc, next) => {
      const playlistsIds = next.inPlaylists?.map(({ _id }) => _id)
      if (playlistsIds?.length) {
        playlistsIds.forEach((key) => {
          acc.has(key.toString())
            ? acc.get(key.toString())?.push(next._id)
            : acc.set(key.toString(), [next._id])
        })
      }
      return acc
    }, new Map())

    await categoriesServices.cleanAlbums(Artist, album.artist._id, _id)
    await categoriesServices.cleanAlbums(Genre, album.genre._id, _id)
    await categoriesServices.cleanAlbums(Period, album.period._id, _id)
    await tracksServices.remove(album.tracks.map(({ _id }) => _id))

    if (collections?.length) {
      await collectionsServices.cleanCollection(collections, _id)
    }

    if (playlists.size > 0) {
      await playlistsServices.cleanPlaylist(playlists)
    }

    return await Album.findByIdAndDelete(_id)
  }

  async getAlbumsList(req: Request) {
    // const query = req.body.filters
    //   ? req.body.filters.reduce((acc: any, next: any) => {
    //     acc[next.entityType] = new Types.ObjectId(next.entityValue)
    //     if (next.exclude) {
    //       acc._id = { $ne: new Types.ObjectId(next.entityValue) }
    //     }
    //     return acc
    //   }, {})
    //   : {}

    if (req.body.isRandom) {
      return await this.getRandomAlbums(req.body.limit, req.body.filter)
    }

    const populate: Populate[] = [
      { path: 'artist', select: ['title'] },
      { path: 'genre', select: ['title'] },
      { path: 'period', select: ['title'] },
      { path: 'inCollections', select: ['title'] }
    ]

    const options: PaginationOptions = {
      page: req.body.page,
      limit: req.body.limit,
      sort: req.body.sort,
      populate,
      lean: true,
      select: { title: true, folderName: true }
    }

    const dbList = await Album.paginate({}, options)

    if (dbList) {
      const { totalDocs, totalPages, page } = dbList
      const pagination = new PaginationDTO({ totalDocs, totalPages, page })

      const dbDocs = dbList.docs as unknown as AlbumResponse[]
      const docs = await Promise.all(dbDocs.map(async (album) => {
        const cover = await Cloud.getFile(
          `${process.env['COLLECTION_ROOT']}/Collection/${utils.sanitizeURL(album.folderName)}/cover.webp`
        )
        return new AlbumItemDTO(album, cover || undefined)
      }))

      return { docs, pagination }
    }

    throw new Error('Incorrect request options')
  }

  async getRandomAlbums(size: number, filter?: Record<string, Record<string, any>>) {
    const basicConfig = [
      {
        $lookup: {
          from: 'artists',
          localField: 'artist',
          foreignField: '_id',
          as: 'artist'
        }
      },
      {
        $lookup: {
          from: 'genres',
          localField: 'genre',
          foreignField: '_id',
          as: 'genre'
        }
      },
      {
        $lookup: {
          from: 'periods',
          localField: 'period',
          foreignField: '_id',
          as: 'period'
        }
      },
      { $sample: { size } }
    ]

    const config = basicConfig.reduce<PipelineStage[]>((acc, next) => {
      acc.push(next)
      if (filter && filter['from'] === next.$lookup?.from) {
        acc.push({
          $match: {
            [String(filter['key'])]: new Types.ObjectId(String(filter['value']))
          }
        })

        if (filter['excluded']) {
          const lastProp = acc.at(-1)
          if (lastProp) {
            Object.entries(filter['excluded']).forEach(([key, value]) => {
              // @ts-ignore
              lastProp.$match[key] = { $ne: new Types.ObjectId(String(value)) }
            })
          }
        }
      }
      return acc
    }, [])

    const response = await Album.aggregate(config)

    if (response) {
      const coveredAlbums = response.map(async (album) => {
        const cover = await Cloud.getFile(`${process.env['COLLECTION_ROOT']}/Collection/${utils.sanitizeURL(album.folderName)}/cover.webp`)
        return new AlbumItemDTO({
          ...album,
          artist: Array.isArray(album.artist) ? album.artist[0] : album.artist,
          genre: Array.isArray(album.genre) ? album.genre[0] : album.genre,
          period: Array.isArray(album.period) ? album.period[0] : album.period
        }, cover || undefined)
      })

      const albums = await Promise.all(coveredAlbums)
      return { docs: albums }
    }

    throw new Error('Incorrect request options')
  }

  async getSingleAlbum(id: string | Types.ObjectId) {
    if (id === 'random') {
      const randomAlbum = await this.getRandomAlbum()
      return randomAlbum
    }

    const singleAlbum: AlbumResponse = await Album.findById(id)
      .populate({ path: 'artist', select: ['title'] })
      .populate({ path: 'genre', select: ['title'] })
      .populate({ path: 'period', select: ['title'] })
      .populate({
        path: 'tracks',
        populate: [
          { path: 'artist', select: ['title'] },
          { path: 'inAlbum', select: ['title'] }
        ]
      })
      .lean()

    if (singleAlbum) {
      const cover = await Cloud.getFile(
        `${process.env['COLLECTION_ROOT']}/Collection/${utils.sanitizeURL(singleAlbum.folderName)}/cover.webp`
      )
      return new AlbumSingleDTO(
        singleAlbum,
        singleAlbum.tracks.map((track) => new TrackDTO(track)),
        cover || undefined
      )
    }

    throw new Error('Incorrect request options')
  }

  async getRandomAlbum() {
    const count = await Album.countDocuments()
    const randomIndex = Math.floor(Math.random() * count)
    const randomAlbum: AlbumResponse = await Album.findOne().skip(randomIndex)
      .populate({ path: 'artist', select: ['title'] })
      .populate({ path: 'genre', select: ['title'] })
      .populate({ path: 'period', select: ['title'] })
      .populate({
        path: 'tracks',
        populate: [
          { path: 'artist', select: ['title'] },
          { path: 'inAlbum', select: ['title'] }
        ]
      })
      .lean()
  
    if (randomAlbum) {
      const cover = await Cloud.getFile(
        `${process.env['COLLECTION_ROOT']}/Collection/${utils.sanitizeURL(randomAlbum.folderName)}/cover.webp`
      )
      return new AlbumSingleDTO(
        randomAlbum,
        randomAlbum.tracks.map((track) => new TrackDTO(track)),
        cover || undefined
      )
    }
  
    throw new Error('Incorrect request options')
  }
}

export default new AlbumsServices()
