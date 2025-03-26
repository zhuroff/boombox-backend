import { Request } from 'express'
import { Document, Default__v, IfAny, PaginateModel, Require_id, Types, PaginateResult, UpdateWriteOpResult, Model } from 'mongoose'
import { ArtistDocument } from '../models/artist.model'
import { GenreDocument } from '../models/genre.model'
import { PeriodDocument } from '../models/period.model'
import { CollectionDocument, CollectionDocumentAlbum } from '../models/collection.model'
import { NewCollectionPayload } from './reqres.types'

export type ModelKeys =
  | 'albums'
  | 'embedded'
  | 'artists'
  | 'genres'
  | 'periods'
  | 'collections'
  | 'compilations'
  | 'tracks'
  | 'users'
  | 'tokens'

export interface BasicEntity {
  _id: Types.ObjectId
  title: string
}

export interface GatheringCreatePayload {
  entityID: string
  title: string
}

export interface GatheringUpdatePayload {
  entityID: Types.ObjectId | string
  gatheringID: string
  isInList: boolean
  order: number
}

export interface GatheringUpdateProps {
  itemID: string | Types.ObjectId
  inList: boolean
  listID: string
  order?: number
}

export interface GatheringReorder {
  oldOrder: number
  newOrder: number
}

export interface FileLinkPayload {
  fieldname: string
  filename: string
}

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
}

export interface CollectionRepository {
  getRawCollections(): Promise<CollectionDocument[]>
  getPaginatedCollections(req: Request): Promise<PaginateResult<CollectionDocument | null>>
  getRawCollection(id: Types.ObjectId | string): Promise<CollectionDocument | null>
  getPopulatedCollection(id: string): Promise<CollectionDocument | null>
  createCollection(payload: NewCollectionPayload): Promise<CollectionDocument>
  updateCollection(payload: GatheringUpdatePayload): Promise<void>
  updateCollectionOrder(_id: Types.ObjectId | string, albums: CollectionDocumentAlbum[]): Promise<void>
  removeCollection(id: Types.ObjectId | string): Promise<CollectionDocument | null>
  cleanCollection(collectionIds: Types.ObjectId[], albumId: Types.ObjectId | string): Promise<UpdateWriteOpResult>
}

export interface FileRepository {
  updateModelFileLink<T, U extends Model<T>>(
    payload: FileLinkPayload,
    _id: Types.ObjectId | string,
    Model: U
  ): Promise<IfAny<T, any, Document<unknown, {}, T> & Default__v<Require_id<T>>> | null>
}
