import { Request } from 'express'
import { PaginateModel, PaginateOptions, Types } from 'mongoose'
import { AlbumDocument } from '../models/album.model'
import { Embedded } from '../models/embedded.model'
import { CategoryDocument } from '../types/common.types'
import { CategoryItemDTO, CategoryPageDTO } from '../dto/category.dto'
import { PaginationDTO } from '../dto/pagination.dto'
import { getCloudApi } from '..'
import utils from '../utils'

export default {
  async getList(Model: PaginateModel<CategoryDocument>, req: Request) {
    const populates = [
      { path: 'albums', select: ['_id'] },
      { path: 'embeddedAlbums', select: ['_id'], model: Embedded }
    ]

    const options: PaginateOptions = {
      page: req.body.page,
      limit: req.body.limit,
      sort: req.body.sort,
      populate: populates,
      lean: true,
      select: {
        title: true,
        avatar: true
      }
    }

    const dbList = await Model.paginate({}, options)

    if (dbList) {
      const { totalDocs, totalPages, page } = dbList
      const pagination = new PaginationDTO({ totalDocs, totalPages, page })

      const docs = dbList.docs.map((category) => new CategoryItemDTO(category))

      return { docs, pagination }
    }

    throw new Error()
  },
  async single(Model: PaginateModel<CategoryDocument>, req: Request) {
    const categorySingle = await Model.findById(req.params['id'])
      .populate({
        path: 'albums',
        select: ['title', 'folderName', 'cloudURL'],
        populate: [
          { path: 'artist', select: ['title', '_id'] },
          { path: 'genre', select: ['title', '_id'] },
          { path: 'period', select: ['title', '_id'] }
        ]
      })
      .populate({
        path: 'embeddedAlbums',
        select: ['title', 'frame'],
        populate: [
          { path: 'artist', select: ['title', '_id'] },
          { path: 'genre', select: ['title', '_id'] },
          { path: 'period', select: ['title', '_id'] }
        ]
      })
      .lean()

    if (!categorySingle) {
      throw new Error('Category not found')
    }

    const coveredAlbumsRes = categorySingle.albums.map(async (album): Promise<AlbumDocument> => {
      const cover = await getCloudApi(album.cloudURL).getFile(
        `${utils.sanitizeURL(album.folderName)}/cover.webp`,
        'image'
      )
      return { ...album, cover }
    })

    const coveredAlbums = await Promise.all(coveredAlbumsRes)

    return new CategoryPageDTO({ ...categorySingle, albums: coveredAlbums })
  },
  async create(Model: PaginateModel<CategoryDocument>, title: string, _id?: Types.ObjectId) {
    if (!title) throw new Error('Title is required')
    const query = { title }
    const update = { $push: { albums: _id } }
    const options = { upsert: true, new: true, setDefaultsOnInsert: true }

    return await Model.findOneAndUpdate(query, update, options)
  },
  async remove<T>(Model: PaginateModel<T>, _id: string) {
    await Model.deleteOne({ _id })
    return { message: 'Category successfully deleted' }
  },
  async cleanAlbums(Model: PaginateModel<CategoryDocument>, categoryId: Types.ObjectId, albumId: Types.ObjectId | string) {
    const query = { _id: categoryId }
    const update = { $pull: { albums: albumId } }
    await Model.findOneAndUpdate(query, update)
  }
}
