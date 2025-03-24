import { Types, PaginateModel } from 'mongoose'
import { CategoryDocument, CategoryRepository } from '../types/common.types'

export default class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  async createCategory<T>(Model: PaginateModel<T>, title: string, _id?: Types.ObjectId) {
    if (!title) {
      throw new Error('Title is required')
    }

    return await this.categoryRepository.createCategory<T>(Model, title, _id)
  }

  async cleanAlbums(
    Model: PaginateModel<CategoryDocument>,
    categoryId: Types.ObjectId,
    albumId: Types.ObjectId | string
  ) {
    await this.categoryRepository.cleanAlbums(Model, categoryId, albumId)
  }
}
