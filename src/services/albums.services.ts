import { Request } from 'express'
import { Types, PipelineStage, PaginateOptions, PopulateOptions } from 'mongoose'
import { getCloudApi } from '..'
import { Album, AlbumDocument } from '../models/album.model'
import { Artist } from '../models/artist.model'
import { Genre } from '../models/genre.model'
import { Period } from '../models/period.model'
import { RequestFilter } from '../types/reqres.types'
import { AlbumShape } from '../types/album.types'
import { AlbumItemDTO, AlbumPageDTO } from '../dto/album.dto'
import { PaginationDTO } from '../dto/pagination.dto'
import { CloudEntityDTO } from '../dto/cloud.dto'
import utils from '../utils'
import categoriesServices from './categories.services'
import tracksServices from './tracks.services'
import collectionsServices from './collections.services'
import compilationsServices from './compilations.services'

export default {
  async getAlbumDocs() {
    return await Album.find({}, { folderName: true, cloudURL: true })
  },

  async createShape(album: CloudEntityDTO): Promise<AlbumShape> {
    const cloudAPI = getCloudApi(album.cloudURL)
    const albumContent = await cloudAPI.getFolderContent(
      `${album.path}&limit=100`
    ) || { items: [] }
    
    return {
      folderName: album.title,
      cloudURL: album.cloudURL,
      title: utils.parseAlbumTitle(album.title),
      artist: utils.parseArtistName(album.title),
      genre: utils.parseAlbumGenre(album.title),
      period: utils.getAlbumReleaseYear(album.title),
      tracks: utils.fileFilter(albumContent.items, utils.audioMimeTypes)
    }
  },

  async createAlbum(shape: AlbumShape) {
    try {
      const newAlbum = new Album(shape)
      const newArtist = await categoriesServices.create(Artist, shape.artist, newAlbum._id)
      const newGenre = await categoriesServices.create(Genre, shape.genre, newAlbum._id)
      const newPeriod = await categoriesServices.create(Period, shape.period, newAlbum._id)

      if (newArtist && newGenre && newPeriod) {
        const albumTracks = await Promise.all(shape.tracks.map(async (track) => (
          await tracksServices.create(track, newAlbum._id, newArtist._id, shape.cloudURL)
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
    } catch (error) {
      throw error
    }
  },

  async removeAlbum(_id: Types.ObjectId | string) {
    const album = await this.getSingle(_id, false)
    const collections = album.inCollections?.map(({ _id }) => _id)
    const compilations = album.tracks.reduce<Map<string, string[]>>((acc, next) => {
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

    await categoriesServices.cleanAlbums(Artist, album.artist._id, _id)
    await categoriesServices.cleanAlbums(Genre, album.genre._id, _id)
    await categoriesServices.cleanAlbums(Period, album.period._id, _id)
    await tracksServices.remove(album.tracks.map(({ _id }) => _id))

    if (collections?.length) {
      await collectionsServices.cleanCollection(collections, _id)
    }
    
    if (compilations.size > 0) {
      await compilationsServices.cleanCompilation(compilations)
    }

    return await Album.findByIdAndDelete(_id)
  },

  async updateAlbums(albums: AlbumDocument[]) {
    return await Promise.all(albums.map(async (album) => (
      await Album.findOneAndUpdate(
        { _id: album._id },
        { $set: { modified: new Date(), cloudURL: album.cloudURL } },
        { new: true }
      )
    )))
  },

  async getCoveredAlbums(docs: AlbumDocument[]) {
    return await Promise.all(docs.map(async (album) => {
      const cloudAPI = getCloudApi(album.cloudURL)
      const cover = await cloudAPI.getFile(
        `${utils.sanitizeURL(album.folderName)}/cover.webp`,
        'image'
      )
      return new AlbumItemDTO(album, cover || undefined)
    }))
  },

  async getList(req: Request) {
    if (req.body.isRandom) {
      return await this.getListRandom(req.body.limit, req.body.filter)
    }

    const populate: PopulateOptions[] = [
      { path: 'artist', select: ['title'] },
      { path: 'genre', select: ['title'] },
      { path: 'period', select: ['title'] },
      { path: 'inCollections', select: ['title'] }
    ]

    const options: PaginateOptions = {
      page: req.body.page,
      limit: req.body.limit,
      sort: req.body.sort,
      populate,
      lean: true,
      select: { title: true, folderName: true, cloudURL: true }
    }

    const dbList = await Album.paginate({}, options)

    if (dbList) {
      const { totalDocs, totalPages, page } = dbList
      const pagination = new PaginationDTO({ totalDocs, totalPages, page })
      const docs = await this.getCoveredAlbums(dbList.docs)

      return { docs, pagination }
    }

    throw new Error('Incorrect request options')
  },

  async getListRandom(size: number, filter?: RequestFilter) {
    const basicConfig: PipelineStage[] = [
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

    const aggregateConfig: PipelineStage[] = []

    for (const stage of basicConfig) {
      aggregateConfig.push(stage)
      if (!filter) continue
      if (filter.from === (stage as PipelineStage.Lookup).$lookup?.from) {
        aggregateConfig.push({
          $match: {
            [String(filter['key'])]: new Types.ObjectId(String(filter['value']))
          }
        })

        if (filter['excluded']) {
          const lastProp = aggregateConfig.at(-1) as PipelineStage.Match | undefined
          if (lastProp) {
            Object.entries(filter['excluded']).forEach(([key, value]) => {
              lastProp.$match[key] = { $ne: new Types.ObjectId(String(value)) }
            })
          }
        }
      }
    }

    const response = await Album.aggregate<AlbumDocument>(aggregateConfig)

    if (response) {
      const coveredAlbums = await this.getCoveredAlbums(
        response.map((album) => ({
          ...album,
          artist: Array.isArray(album.artist) ? album.artist[0] : album.artist,
          genre: Array.isArray(album.genre) ? album.genre[0] : album.genre,
          period: Array.isArray(album.period) ? album.period[0] : album.period
        }))
      )
      const albums = await Promise.all(coveredAlbums)
      return { docs: albums }
    }

    throw new Error('Incorrect request options')
  },

  async getSingle(id: string | Types.ObjectId, withCover = true) {
    if (id === 'random') {
      const randomAlbum = await this.getSingleRandom()
      return randomAlbum
    }

    const singleAlbum: AlbumDocument | null = await Album.findById(id)
      .populate({ path: 'artist', select: ['title'] })
      .populate({ path: 'genre', select: ['title'] })
      .populate({ path: 'period', select: ['title'] })
      .populate({ path: 'inCollections', select: ['title'] })
      .populate({
        path: 'tracks',
        populate: [
          { path: 'artist', select: ['title'] },
          { path: 'inAlbum', select: ['title', 'folderName', 'cloudURL'] },
          { path: 'inCompilations', select: ['title'] }
        ]
      })
      .lean()

    if (!singleAlbum) {
      throw new Error('Incorrect request options or album not found')
    }

    try {
      const cloudAPI = getCloudApi(singleAlbum.cloudURL)
      const cover = withCover ? await cloudAPI.getFile(
        `${utils.sanitizeURL(singleAlbum.folderName)}/cover.webp`,
        'image'
      ) : undefined
      
      return new AlbumPageDTO(singleAlbum, cover)
    } catch (error) {
      throw new Error('Incorrect request options or album not found')
    }
  },

  async getSingleRandom() {
    const count = await Album.countDocuments()
    const randomIndex = Math.floor(Math.random() * count)
    const randomAlbum = await Album.findOne<AlbumDocument>().skip(randomIndex)
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
      const cloudAPI = getCloudApi(randomAlbum.cloudURL)
      const cover = await cloudAPI.getFile(
        `${utils.sanitizeURL(randomAlbum.folderName)}/cover.webp`,
        'image'
      )
      return new AlbumPageDTO(randomAlbum, cover)
    }
  
    throw new Error('Incorrect request options')
  }
}
