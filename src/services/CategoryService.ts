import { Request } from 'express'
import { Types, PaginateModel } from 'mongoose'
import { AlbumRepository } from '../types/album.types'
import { CategoryDocument, CategoryRepository } from '../types/common.types'
import { CategoryItemDTO, CategoryPageDTO } from '../dto/category.dto'
import { PaginationDTO } from '../dto/pagination.dto'

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
    return new CategoryPageDTO({
      ...targetCategory,
      albums: albumsResponse.map(({ album }) => album)
    })
  }

  async getCategories(Model: PaginateModel<CategoryDocument>, req: Request) {
    const categories = await this.categoryRepository.getPopulatedCategories(Model, req)

    if (!categories.docs?.every((col) => !!col)) {
      throw new Error('Incorrect request options')
    }

    const { totalDocs, totalPages, page } = categories
    const pagination = new PaginationDTO({ totalDocs, totalPages, page })
    const docs = categories.docs.map((category) => new CategoryItemDTO(category))

    return { docs, pagination }
  }
}
