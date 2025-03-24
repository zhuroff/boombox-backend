import { Types, PaginateModel } from 'mongoose'
import { CategoryDocument, CategoryRepository } from '../types/common.types'

export default class CategoryRepositoryContract implements CategoryRepository {
  async createCategory<T>(Model: PaginateModel<T>, title: string, _id?: Types.ObjectId) {
    const query = { title }
    const update = { $push: { albums: _id } }
    const options = { upsert: true, new: true, setDefaultsOnInsert: true }

    return await Model.findOneAndUpdate(query, update, options)
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
}
