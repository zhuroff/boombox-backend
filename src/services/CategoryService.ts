import { Request } from 'express'
import { Types, PaginateModel } from 'mongoose'
import { AlbumRepository } from '../types/album.types'
import { CategoryDocument, CategoryRepository } from '../types/category.types'
import CategoryViewFactory from '../views/CategoryViewFactory'
import PaginationViewFactory from '../views/PaginationViewFactory'

export default class CategoryService {
  constructor(
    private categoryRepository: CategoryRepository,
    private albumRepository: AlbumRepository
  ) {}

  async createCategory<T>(Model: PaginateModel<T>, title: string, _id?: Types.ObjectId) {
    if (!title) {
      throw new Error('Title is required')
    }

    return await this.categoryRepository.createCategory<T>(Model, title, _id)
  }

  async removeCategory<T>(Model: PaginateModel<T>, _id: string) {
    await this.categoryRepository.removeCategory<T>(Model, _id)
    return { message: 'category.removed' }
  }

  async cleanAlbums(
    Model: PaginateModel<CategoryDocument>,
    categoryId: Types.ObjectId,
    albumId: Types.ObjectId | string
  ) {
    await this.categoryRepository.cleanAlbums(Model, categoryId, albumId)
  }

  async getCategory(Model: PaginateModel<CategoryDocument>, req: Request) {
    const targetCategory = await this.categoryRepository.getPopulatedCategory(Model, req)

    if (!targetCategory) {
      throw new Error('Category not found')
    }

    const coveredCategoryAlbums = await this.albumRepository.getCoveredAlbums(targetCategory.albums)
    const albumsResponse = await Promise.all(coveredCategoryAlbums)

    return CategoryViewFactory.createCategoryPageView({
      ...targetCategory,
      albums: albumsResponse.map(({ album, cover }) => ({ ...album, cover }))
    })
  }

  async getCategories(Model: PaginateModel<CategoryDocument>, req: Request) {
    const categories = await this.categoryRepository.getPopulatedCategories(Model, req)

    if (!categories.docs?.every((col) => !!col)) {
      throw new Error('Incorrect request options')
    }

    const { totalDocs, totalPages, page } = categories
    const pagination = PaginationViewFactory.create({ totalDocs, totalPages, page })
    const docs = categories.docs.map((category) => (
      CategoryViewFactory.createCategoryItemView(category)
    ))

    return { docs, pagination }
  }
}
