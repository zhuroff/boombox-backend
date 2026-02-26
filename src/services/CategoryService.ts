import { Request } from 'express'
import { Types, PaginateModel } from 'mongoose'
import { Artist } from '../models/artist.model'
import { Genre } from '../models/genre.model'
import { Period } from '../models/period.model'
import { AlbumRepository } from '../types/album'
import { CategoryDocument, CategoryRepository } from '../types/category'
import { ListRequestConfig } from '../types/pagination'
import CategoryViewFactory from '../views/CategoryViewFactory'
import PaginationViewFactory from '../views/PaginationViewFactory'
import Parser from '../utils/Parser'

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
    return await this.categoryRepository.cleanAlbums(Model, categoryId, albumId)
  }

  async cleanupEmptyCategories() {
    const emptyOrOrphaned = [
      { $lookup: { from: 'albums', localField: 'albums', foreignField: '_id', as: 'existingAlbums' } },
      { $match: { $expr: { $eq: [{ $size: '$existingAlbums' }, 0] } } },
      { $project: { _id: 1 } }
    ]

    const [orphanArtists, orphanGenres, orphanPeriods] = await Promise.all([
      Artist.aggregate<{ _id: Types.ObjectId }>(emptyOrOrphaned),
      Genre.aggregate<{ _id: Types.ObjectId }>(emptyOrOrphaned),
      Period.aggregate<{ _id: Types.ObjectId }>(emptyOrOrphaned)
    ])

    const ids = (arr: { _id: Types.ObjectId }[]) => arr.map((d) => d._id)

    await Promise.all([
      Artist.deleteMany({ _id: { $in: ids(orphanArtists) } }),
      Genre.deleteMany({ _id: { $in: ids(orphanGenres) } }),
      Period.deleteMany({ _id: { $in: ids(orphanPeriods) } })
    ])
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
      albums: albumsResponse
        .map(({ album, cover }) => ({ ...album, cover }))
        .sort((a, b) => {
          let comparison = parseInt(a.period.title) - parseInt(b.period.title)

          if (comparison === 0) {
            comparison = a.title.localeCompare(b.title)
          }
          
          return comparison
        })
    })
  }

  async getCategories(Model: PaginateModel<CategoryDocument>, req: Request) {
    const parsedQuery = Parser.parseNestedQuery<ListRequestConfig>(req)
    const categories = await this.categoryRepository.getPopulatedCategories(Model, parsedQuery)

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
