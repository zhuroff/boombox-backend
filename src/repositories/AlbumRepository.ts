import { Document, PaginateOptions, PipelineStage, PopulateOptions, FilterQuery, Types } from 'mongoose'
import { Album, AlbumDocument } from '../models/album.model'
import { CollectionDocumentAlbum } from '../models/collection.model'
import { AlbumAttrs, AlbumRepository } from '../types/album.types'
import { ListRequestConfig } from '../types/reqres.types'
import { GatheringUpdateProps } from '../types/common.types'
import { getCloudApi } from '..'

export default class AlbumRepositoryContract implements AlbumRepository {
  getAlbumRandom(): Promise<AlbumDocument> {
    throw new Error('Method not implemented.')
  }
  async fetchAlbumDocs(): Promise<AlbumDocument[]> {
    return await (
      Album.find({}, {
        folderName: true,
        cloudURL: true,
        cloudId: true,
      })
      .populate({
        path: 'tracks',
        select: ['fileName', 'mimeType']
      })
    )
  }

  async saveNewAlbum(newAlbum: Document<AlbumDocument>, attrs: AlbumAttrs) {
    const dateOfCreation = new Date()
    const { artist, genre, period, tracks } = attrs

    newAlbum.$set({ artist })
    newAlbum.$set({ genre })
    newAlbum.$set({ period })
    newAlbum.$set({ tracks })
    newAlbum.$set({ created: dateOfCreation })
    newAlbum.$set({ modified: dateOfCreation })

    return await newAlbum.save()
  }

  async updateAlbums(albums: AlbumDocument[]) {
    return await Promise.all(albums.map(async (album) => (
      await Album.findOneAndUpdate(
        { _id: album._id },
        { $set: { modified: new Date(), cloudURL: album.cloudURL } },
        { new: true }
      )
    )))
  }

  async updateCollectionsInAlbum({ listID, itemID, inList }: GatheringUpdateProps) {
    const query = { _id: itemID }
    const update = inList
      ? { $pull: { inCollections: listID } }
      : { $push: { inCollections: listID } }
    const options = { new: true }

    await Album.findOneAndUpdate(query, update, options)
  }

  async cleanAlbumCollections(albums: CollectionDocumentAlbum[], listID: string | Types.ObjectId) {
    const cleanProcess = albums.map(async (album) => {
      const query: FilterQuery<AlbumDocument> = { _id: new Types.ObjectId(album.album.toString()) }
      const update = { $pull: { inCollections: listID } }
      const options = { new: true }

      return await Album.findOneAndUpdate(query, update, options)
    })

    return await Promise.all(cleanProcess)
  }

  async getAlbum(id: Types.ObjectId | 'random') {
    // const count = await Album.countDocuments()
    // const randomIndex = Math.floor(Math.random() * count)

    const album = await (
      id === 'random'
        ? Album.findOne<AlbumDocument>().skip(Math.floor(Math.random() * await Album.countDocuments()))
        : Album.findById(id)
    )
    .populate([
      { path: 'artist', select: ['title'] },
      { path: 'genre', select: ['title'] },
      { path: 'period', select: ['title'] },
      { path: 'inCollections', select: ['title'] },
      {
        path: 'tracks',
        populate: [
          { path: 'artist', select: ['title'] },
          { path: 'genre', select: ['title'] },
          { path: 'period', select: ['title'] },
          { path: 'inAlbum', select: ['title', 'folderName', 'cloudURL'] },
          { path: 'inCompilations', select: ['title'] }
        ]
      }
    ])
    .lean()

    if (!album) {
      throw new Error('Incorrect request options')
    }
    
    return album
  }

  async getAlbums(body: ListRequestConfig) {
    const populate: PopulateOptions[] = [
      { path: 'artist', select: ['title'] },
      { path: 'genre', select: ['title'] },
      { path: 'period', select: ['title'] },
      { path: 'inCollections', select: ['title'] }
    ]

    const options: PaginateOptions = {
      page: body.page,
      limit: body.limit,
      sort: body.sort,
      populate,
      lean: true,
      select: {
        title: true,
        folderName: true,
        cloudURL: true,
        cloudId: true
      }
    }

    return await Album.paginate({}, options)
  }

  async getAlbumsRandom(limit: number, filter?: ListRequestConfig['filter']) {
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
      {
        $sample: {
          size: limit
        }
      }
    ]

    const aggregateConfig: PipelineStage[] = []

    for (const stage of basicConfig) {
      aggregateConfig.push(stage)

      if (!filter || !('value' in filter)) continue

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

    return await Album.aggregate<AlbumDocument>(aggregateConfig)
  }

  async deleteAlbum(id: Types.ObjectId | string) {
    return await Album.findByIdAndDelete(id)
  }

  async getCoveredAlbums(docs: AlbumDocument[]) {
    return await Promise.all(docs.map(async (album) => {
      const cloudAPI = getCloudApi(album.cloudURL)
      const cover = await cloudAPI.getFile({
        id: album.cloudId,
        path: `${album.folderName}/cover.webp`,
        fileType: 'image'
      })

      return { album, cover }
    }))
  }

  // async getAlbumRandom() {
  //   const count = await Album.countDocuments()
  //   const randomIndex = Math.floor(Math.random() * count)
  //   const randomAlbum = await Album.findOne<AlbumDocument>().skip(randomIndex)
  //     .populate({ path: 'artist', select: ['title'] })
  //     .populate({ path: 'genre', select: ['title'] })
  //     .populate({ path: 'period', select: ['title'] })
  //     .populate({ path: 'inCollections', select: ['title'] })
  //     .populate({
  //       path: 'tracks',
  //       populate: [
  //         { path: 'artist', select: ['title'] },
  //         { path: 'genre', select: ['title'] },
  //         { path: 'period', select: ['title'] },
  //         { path: 'inAlbum', select: ['title'] },
  //         { path: 'inCompilations', select: ['title'] }
  //       ]
  //     })
  //     .lean()

  //   if (!randomAlbum) {
  //     throw new Error('Incorrect request options')
  //   }
    
  //   return randomAlbum
  // }
}
