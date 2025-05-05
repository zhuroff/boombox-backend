import { Request } from 'express'
import { Types, PaginateModel, FilterQuery, PaginateOptions, UpdateQuery, QueryOptions } from 'mongoose'
import { Embedded } from '../models/embedded.model'
import { CategoryDocument, CategoryRepository } from '../types/category.types'
import { ListRequestConfig } from '../types/pagination.types'

export default class CategoryRepositoryContract implements CategoryRepository {
  async createCategory<T>(Model: PaginateModel<T>, title: string, _id?: Types.ObjectId) {
    const query = { title }
    const update = { $push: { albums: _id } }
    const options = { upsert: true, new: true, setDefaultsOnInsert: true }

    return await Model.findOneAndUpdate(query, update, options)
  }

  async removeCategory<T>(Model: PaginateModel<T>, _id: string) {
    await Model.deleteOne({ _id } as FilterQuery<T>)
  }

  async cleanAlbums(
    Model: PaginateModel<CategoryDocument>,
    categoryId: Types.ObjectId,
    albumId: Types.ObjectId | string
  ) {
    const query = { _id: categoryId }
    const update = { $pull: { albums: albumId } }
    await Model.findOneAndUpdate(query, update)
  }

  async getPopulatedCategory(Model: PaginateModel<CategoryDocument>, req: Request) {
    return await Model.findById(req.params['id'])
      .populate({
        path: 'albums',
        select: ['title', 'folderName', 'cloudURL', 'cloudId', 'path'],
        populate: [
          { path: 'artist', select: ['title', '_id'] },
          { path: 'genre', select: ['title', '_id'] },
          { path: 'period', select: ['title', '_id'] },
          { path: 'inCollections', select: ['title', '_id'] }
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
  }

  async getPopulatedCategories(
    Model: PaginateModel<CategoryDocument>,
    body: ListRequestConfig
  ) {
    const populates = [
      { path: 'albums', select: ['_id'] },
      { path: 'embeddedAlbums', select: ['_id'], model: Embedded }
    ]

    const options: PaginateOptions = {
      page: body.page,
      limit: body.limit,
      sort: body.sort,
      populate: populates,
      lean: true,
      select: {
        title: true,
        avatar: true
      }
    }

    return await Model.paginate({}, options)
  }

  async updateCategory(
    Model: PaginateModel<CategoryDocument>,
    filter: FilterQuery<CategoryDocument>,
    update: UpdateQuery<CategoryDocument>,
    options: QueryOptions = {}
  ) {
    return await Model.findOneAndUpdate(filter, update, { new: true, ...options })
  }
}
