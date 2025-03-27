import { Request } from 'express'
import { Document, Default__v, IfAny, PaginateModel, Require_id, Types, PaginateResult, UpdateWriteOpResult, Model, RootFilterQuery, DeleteResult } from 'mongoose'
import { ArtistDocument } from '../models/artist.model'
import { GenreDocument } from '../models/genre.model'
import { PeriodDocument } from '../models/period.model'
import { TrackDocument } from '../models/track.model'
import { UserDocument } from '../models/user.model'
import { TokenDocument } from '../models/token.model'
import { CollectionDocument, CollectionDocumentAlbum } from '../models/collection.model'
import { CompilationDocument, CompilationDocumentTrack } from '../models/compilation.model'
import { ListRequestConfig, NewCollectionPayload, NewCompilationPayload, SearchConfig, SearchParams, SearchPayload } from './reqres.types'
import { AlbumItemDTO } from '../dto/album.dto'

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

export interface UserDataPayload {
  login: string
  email: string
  role: string
  password: string
}

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
  removeCategory<T>(Model: PaginateModel<T>, _id: string): Promise<void>
  getPopulatedCategory(Model: PaginateModel<CategoryDocument>, req: Request): Promise<CategoryDocument | null>
  getPopulatedCategories(Model: PaginateModel<CategoryDocument>, req: Request): Promise<PaginateResult<CategoryDocument | null>>
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

export interface CompilationRepository {
  getRawCompilations(): Promise<CompilationDocument[]>
  getRawCompilation(id: Types.ObjectId | string): Promise<CompilationDocument | null>
  createCompilation(payload: NewCompilationPayload): Promise<CompilationDocument>
  updateCompilation(payload: GatheringUpdatePayload): Promise<void>
  removeCompilation(id: string): Promise<CompilationDocument | null>
  updateCompilationOrder(_id: Types.ObjectId | string, tracks: CompilationDocumentTrack[]): Promise<void>
  getPaginatedCompilations(req: Request): Promise<PaginateResult<CompilationDocument | null>>
  getPopulatedCompilation(id: string | Types.ObjectId): Promise<CompilationDocument | null>
  cleanCompilation(compilations: Map<string, string[]>): Promise<void>
  renameCompilation(query: { _id: string }, update: { title: string }): Promise<void>
  getRandomCompilations(size: number, filter: NonNullable<ListRequestConfig['filter']>): Promise<CompilationDocument[]>
}

export interface SearchRepository {
  splitSearch(payload: SearchPayload, config?: SearchConfig): Promise<TrackDocument[] | CategoryDocument[] | AlbumItemDTO[]>
  searchEntry<T>(params: SearchParams, Model: SearchConfig): Promise<T>
}

export interface UserRepository {
  findUser(payload: RootFilterQuery<UserDocument>): Promise<UserDocument | null>
  createUser(payload: UserDataPayload): Promise<UserDocument>
  getRawUsers(): Promise<UserDocument[]>
  removeUser(_id: string | Types.ObjectId): Promise<void>
}

export interface TokenRepository {
  createToken(payload: Record<string, string | Types.ObjectId>): Promise<TokenDocument>
  removeToken(refreshToken: string): Promise<DeleteResult>
  getToken(payload: RootFilterQuery<{ user: string | Types.ObjectId }>): Promise<(
    Document<unknown, {}, TokenDocument>
    & {
        refreshToken: string
        user?: Types.ObjectId | null | undefined
      }
  ) | null>
}
