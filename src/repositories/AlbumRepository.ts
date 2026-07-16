import { Request } from 'express'
import {
  HydratedDocument,
  PaginateOptions,
  PaginateResult,
  PipelineStage,
  PopulateOptions,
  QueryFilter,
  Types
} from 'mongoose'
import { Album, AlbumDocument } from '../models/album.model'
import { CollectionDocumentAlbum } from '../models/collection.model'
import { AlbumAttrs, AlbumRepository } from '../types/album'
import { AlbumNoteFilter, AlbumVinylFilter, ListRequestConfig } from '../types/pagination'
import { GatheringUpdateProps } from '../types/gathering'
import { getCloudApi } from '..'

export default class AlbumRepositoryContract implements AlbumRepository {
  readonly #reviewNoteMinLength = 1500
  readonly #defaultAlbumSort: Record<string, 1 | -1> = { dateCreated: -1 }

  #buildAlbumNoteFilterQuery(noteFilter?: AlbumNoteFilter): QueryFilter<AlbumDocument> {
    if (!noteFilter || noteFilter === 'all') {
      return {}
    }

    const noteLength = { $strLenCP: { $ifNull: ['$note', ''] } }

    if (noteFilter === 'withReviews') {
      return { $expr: { $gt: [noteLength, this.#reviewNoteMinLength] } }
    }

    return { $expr: { $lte: [noteLength, this.#reviewNoteMinLength] } }
  }

  #buildVinylFilterQuery(vinylFilter?: AlbumVinylFilter): QueryFilter<AlbumDocument> {
    if (!vinylFilter || vinylFilter === 'all') {
      return {}
    }

    if (vinylFilter === 'onVinyl') {
      return { availableOnVinyl: true }
    }

    return { availableOnVinyl: { $ne: true } }
  }

  #buildAlbumsListQuery(body: ListRequestConfig): QueryFilter<AlbumDocument> {
    const conditions: QueryFilter<AlbumDocument>[] = []

    const noteQuery = this.#buildAlbumNoteFilterQuery(body.noteFilter)
    if (Object.keys(noteQuery).length) {
      conditions.push(noteQuery)
    }

    const vinylQuery = this.#buildVinylFilterQuery(body.vinylFilter)
    if (Object.keys(vinylQuery).length) {
      conditions.push(vinylQuery)
    }

    if (!conditions.length) {
      return {}
    }

    if (conditions.length === 1) {
      return conditions[0]!
    }

    return { $and: conditions }
  }

  #resolveAlbumSort(sort?: ListRequestConfig['sort']): Record<string, 1 | -1> {
    if (!sort) {
      return this.#defaultAlbumSort
    }

    const [[field, direction] = []] = Object.entries(sort)

    if (!field || (direction !== 1 && direction !== -1)) {
      return this.#defaultAlbumSort
    }

    const allowedFields = ['title', 'dateCreated', 'modified', 'period'] as const

    if (!allowedFields.includes(field as (typeof allowedFields)[number])) {
      return this.#defaultAlbumSort
    }

    return { [field]: direction }
  }

  async #getAlbumsSortedByPeriod(
    query: QueryFilter<AlbumDocument>,
    body: ListRequestConfig,
    direction: 1 | -1
  ): Promise<PaginateResult<AlbumDocument>> {
    const page = body.page || 1
    const limit = body.limit || 12
    const skip = (page - 1) * limit

    const [result] = await Album.aggregate<{
      metadata: Array<{ totalDocs: number }>
      docs: AlbumDocument[]
    }>([
      { $match: query },
      {
        $lookup: {
          from: 'periods',
          localField: 'period',
          foreignField: '_id',
          as: 'periodLookup'
        }
      },
      {
        $addFields: {
          periodSortTitle: {
            $ifNull: [{ $arrayElemAt: ['$periodLookup.title', 0] }, '']
          }
        }
      },
      { $sort: { periodSortTitle: direction, _id: 1 } },
      {
        $facet: {
          metadata: [{ $count: 'totalDocs' }],
          docs: [
            { $skip: skip },
            { $limit: limit },
            {
              $lookup: {
                from: 'artists',
                localField: 'artists',
                foreignField: '_id',
                as: 'artists',
                pipeline: [{ $project: { title: 1 } }]
              }
            },
            {
              $lookup: {
                from: 'genres',
                localField: 'genre',
                foreignField: '_id',
                as: 'genre',
                pipeline: [{ $project: { title: 1 } }]
              }
            },
            {
              $addFields: {
                genre: { $arrayElemAt: ['$genre', 0] },
                period: { $arrayElemAt: ['$periodLookup', 0] }
              }
            },
            {
              $project: {
                title: 1,
                path: 1,
                cloudURL: 1,
                artists: { title: 1 },
                genre: { title: 1 },
                period: { title: 1 }
              }
            }
          ]
        }
      }
    ])

    const totalDocs = result?.metadata[0]?.totalDocs ?? 0
    const totalPages = Math.ceil(totalDocs / limit) || 1

    return {
      docs: result?.docs ?? [],
      totalDocs,
      totalPages,
      page,
      limit,
      pagingCounter: skip + 1,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
      offset: skip
    }
  }

  getAlbumRandom(): Promise<AlbumDocument> {
    throw new Error('Method not implemented.')
  }

  async fetchAlbumDocs(): Promise<AlbumDocument[]> {
    return await Album.find(
      {},
      {
        folderName: true,
        cloudURL: true
      }
    ).populate({
      path: 'tracks',
      select: ['fileName', 'mimeType']
    })
  }

  async saveNewAlbum(newAlbum: HydratedDocument<AlbumDocument>, attrs: AlbumAttrs) {
    const dateOfCreation = new Date()
    const { artists, genre, period, tracks } = attrs

    newAlbum.$set({ artists })
    newAlbum.$set({ genre })
    newAlbum.$set({ period })
    newAlbum.$set({ tracks })
    newAlbum.$set({ modified: dateOfCreation })

    return await newAlbum.save()
  }

  async updateAlbumsClouds(albums: AlbumDocument[]) {
    return await Promise.all(
      albums.map(
        async (album) =>
          await Album.findOneAndUpdate(
            { _id: album._id },
            { $set: { modified: new Date(), cloudURL: album.cloudURL } },
            { new: true }
          )
      )
    )
  }

  async updateCollectionsInAlbum({ listID, itemID, inList }: GatheringUpdateProps) {
    const query = { _id: itemID }
    const update = inList ? { $pull: { inCollections: listID } } : { $push: { inCollections: listID } }
    const options = { new: true }

    await Album.findOneAndUpdate(query, update, options)
  }

  async cleanAlbumCollections(albums: CollectionDocumentAlbum[], listID: string | Types.ObjectId) {
    const cleanProcess = albums.map(async (album) => {
      const query: QueryFilter<AlbumDocument> = { _id: new Types.ObjectId(album.album.toString()) }
      const update = { $pull: { inCollections: listID } }
      const options = { new: true }

      return await Album.findOneAndUpdate(query, update, options)
    })

    await Promise.all(cleanProcess)
  }

  async getAlbum(id: Types.ObjectId | 'random') {
    const album = await (
      id === 'random'
        ? Album.findOne<AlbumDocument>().skip(Math.floor(Math.random() * (await Album.countDocuments())))
        : Album.findById(id)
    )
      .populate([
        { path: 'artists', select: ['title'] },
        { path: 'genre', select: ['title'] },
        { path: 'period', select: ['title'] },
        { path: 'inCollections', select: ['title'] },
        {
          path: 'tracks',
          populate: [
            { path: 'artist', select: ['title'] },
            { path: 'period', select: ['title'] },
            { path: 'genre', select: ['title'] },
            { path: 'inCompilations', select: ['title'] },
            { path: 'inAlbum', select: ['title', 'cloudURL'] }
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
    const query = this.#buildAlbumsListQuery(body)
    const sort = this.#resolveAlbumSort(body.sort)

    if ('period' in sort) {
      return await this.#getAlbumsSortedByPeriod(query, body, sort['period'])
    }

    const populate: PopulateOptions[] = [
      { path: 'artists', select: ['title'] },
      { path: 'genre', select: ['title'] },
      { path: 'period', select: ['title'] }
    ]

    const options: PaginateOptions = {
      page: body.page,
      limit: body.limit,
      sort,
      populate,
      lean: true,
      select: {
        title: true,
        path: true,
        cloudURL: true
      }
    }

    return await Album.paginate(query, options)
  }

  async getAlbumsRandom(limit: number, filter?: ListRequestConfig['filter']) {
    const basicConfig: PipelineStage[] = [
      {
        $lookup: {
          from: 'artists',
          localField: 'artists',
          foreignField: '_id',
          as: 'artists'
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
        const filterValue = new Types.ObjectId(String(filter['value']))
        const matchKey = String(filter['key'])
        aggregateConfig.push({
          $match: {
            [matchKey]: filterValue
          }
        })

        if (filter['excluded']) {
          const lastProp = aggregateConfig.at(-1) as PipelineStage.Match | undefined
          if (lastProp) {
            Object.entries(filter['excluded']).forEach(([key, value]) => {
              const objId = new Types.ObjectId(String(value))
              const excludedKey = key.split('>').join('.')
              lastProp.$match[excludedKey] = { $ne: objId }
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
    return await Promise.all(
      docs.map(async (album) => {
        const cover = await this.fetchAlbumCover(album)
        return { album, cover }
      })
    )
  }

  async fetchAlbumCover(album: AlbumDocument) {
    const cloudAPI = getCloudApi(album.cloudURL)
    return await cloudAPI.getFile({
      path: `${album.path}/cover.webp`,
      fileType: 'image'
    })
  }

  async updateAlbumNote(req: Request) {
    const { id } = req.params
    const { note } = req.body
    return await Album.findByIdAndUpdate(id, { $set: { note } }, { new: true })
  }

  async updateAlbumVinylAvailability(req: Request) {
    const { id } = req.params
    const { availableOnVinyl } = req.body
    return await Album.findByIdAndUpdate(id, { $set: { availableOnVinyl: Boolean(availableOnVinyl) } }, { new: true })
  }

  async getAlbumContent(req: Request) {
    const { id, folder } = req.params
    const { limit, offset, fileType } = req.query
    const query = `limit=${limit}&offset=${offset}`

    const album = await Album.findById(id).select(['cloudURL', 'path'])

    if (!album) {
      throw new Error('Album not found')
    }

    const cloudApi = getCloudApi(album.cloudURL)
    const result = await cloudApi.getFolderContent({ path: `${album.path}/${folder}`, query })
    const items = result.items.filter((item) => !!item.mimeType?.includes(String(fileType)))
    return await Promise.all(
      items.map(async (item) => {
        return await cloudApi.getFile({
          path: `${album.path}/${folder}/${item.title}`,
          fileType: String(fileType)
        })
      })
    )
  }
}
