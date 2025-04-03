import { Request } from 'express'
import { Types, Document, Require_id, Default__v, IfAny, PaginateModel, PaginateResult, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose'
import { ArtistDocument } from '../models/artist.model'
import { GenreDocument } from '../models/genre.model'
import { PeriodDocument } from '../models/period.model'

export type CategoryDocument = ArtistDocument | GenreDocument | PeriodDocument

export interface CategoryRepository {
  createCategory<T>(
    Model: PaginateModel<T>,
    title: string,
    _id?: Types.ObjectId
  ): Promise<IfAny<T, any, Document<unknown, {}, T> & Default__v<Require_id<T>>> | null>,
  cleanAlbums(
    Model: PaginateModel<CategoryDocument>,
    categoryId: Types.ObjectId,
    albumId: Types.ObjectId | string
  ): Promise<void>
  updateCategory(
    Model: PaginateModel<CategoryDocument>,
    filter: FilterQuery<CategoryDocument>,
    update: UpdateQuery<CategoryDocument>,
    options?: QueryOptions
  ): Promise<CategoryDocument | null>
  removeCategory<T>(Model: PaginateModel<T>, _id: string): Promise<void>
  getPopulatedCategory(Model: PaginateModel<CategoryDocument>, req: Request): Promise<CategoryDocument | null>
  getPopulatedCategories(Model: PaginateModel<CategoryDocument>, req: Request): Promise<PaginateResult<CategoryDocument | null>>
}
