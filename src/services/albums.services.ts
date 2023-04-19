import { Request } from 'express'
import { Types } from 'mongoose'
import { ApiError } from '../exceptions/api-errors'
import { Album } from '../models/album.model'
import { Artist } from '../models/artist.model'
import { Genre } from '../models/genre.model'
import { Period } from '../models/period.model'
import { AlbumResponse, AlbumShape } from '../types/Album'
import { PaginationOptions, Populate } from '../types/ReqRes'
import { AlbumItemDTO, AlbumSingleDTO } from '../dtos/album.dto'
import { PaginationDTO } from '../dtos/pagination.dto'
import { TrackDTO } from '../dtos/track.dto'
import { CloudEntityDTO } from '../dtos/cloud.dto'
import { cloud } from '../'
import utils from '../utils'
import categoriesServices from './categories.services'
import tracksServices from './tracks.services'
import collectionsServices from './collections.services'
import playlistsServices from './playlists.services'

class AlbumsServices {
  async dbAlbumEntries() {
    return await Album.find({}, { folderName: true, tracks: true })
  }

  async createShape(album: CloudEntityDTO): Promise<AlbumShape> {
    return {
      folderName: album.title,
      title: utils.parseAlbumTitle(album.title),
      artist: utils.parseArtistName(album.title),
      genre: utils.parseAlbumGenre(album.title),
      period: utils.getAlbumReleaseYear(album.title),
      tracks: utils.fileFilter(await cloud.getFolderContent(
        `${process.env['COLLECTION_ROOT'] || ''}/Collection/${album.path}`
      ) || [], utils.audioMimeTypes)
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

      newAlbum.$set({ artist: newArtist._id })
      newAlbum.$set({ genre: newGenre._id })
      newAlbum.$set({ period: newPeriod._id })
      newAlbum.$set({ created: new Date() })
      newAlbum.$set({ modified: new Date() })
      newAlbum.$set({ tracks: albumTracks.map(({ _id }) => _id) })

      return await newAlbum.save()
    }
    return false
  }

  async removeAlbum(_id: Types.ObjectId | string) {
    const album = await this.single(_id)
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

  async list(req: Request) {
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
        const cover = await cloud.getFile(`${process.env['COLLECTION_ROOT']}/Collection/${utils.sanitizeURL(album.folderName)}/cover.webp`)
        return new AlbumItemDTO(album, cover || undefined)
      }))

      return { docs, pagination }
    }

    throw ApiError.BadRequest('Incorrect request options')
  }

  async random(size: number) {
    const response = await Album.aggregate([
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
    ])

    if (response) {
      const coveredAlbums = response.map(async (album) => {
        const cover = await cloud.getFile(`${process.env['COLLECTION_ROOT']}/Collection/${utils.sanitizeURL(album.folderName)}/cover.webp`)
        return new AlbumItemDTO({
          ...album,
          artist: Array.isArray(album.artist) ? album.artist[0] : album.artist,
          genre: Array.isArray(album.genre) ? album.genre[0] : album.genre,
          period: Array.isArray(album.period) ? album.period[0] : album.period
        }, cover || undefined)
      })

      return await Promise.all(coveredAlbums)
    }

    throw ApiError.BadRequest('Incorrect request options')
  }

  async single(id: string | Types.ObjectId) {
    const dbSingle: AlbumResponse = await Album.findById(id)
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

    if (dbSingle) {
      const cover = await cloud.getFile(`${process.env['COLLECTION_ROOT']}/Collection/${utils.sanitizeURL(dbSingle.folderName)}/cover.webp`)
      return new AlbumSingleDTO(
        dbSingle,
        dbSingle.tracks.map((track) => new TrackDTO(track)),
        cover || undefined
      )
    }

    throw ApiError.BadRequest('Incorrect request options')
  }

  async description(_id: string, description: string) {
    const $set = { description }
    await Album.updateOne({ _id }, { $set })
    return { message: 'Description updated' }
  }

  async booklet(path: string) {
    // const bookletRes = await CloudLib.get<CloudFolder>(sanitizeURL(path))
    // // @ts-ignore
    // return bookletRes.data._embedded.items.map((item) => 'file' in item && item.file)
  }
}

export default new AlbumsServices()
