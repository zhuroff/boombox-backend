import { Request } from 'express'
import { PaginateResult, Types, UpdateWriteOpResult } from 'mongoose'
import { CollectionDocument, CollectionDocumentAlbum } from '../models/collection.model'
import { CompilationDocument, CompilationDocumentTrack } from '../models/compilation.model'
import { ListRequestConfig } from './pagination.types'

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

export interface NewCollectionPayload {
  title: string
  albums: {
    album: Types.ObjectId
    order: number
  }[]
}

export interface NewCompilationPayload {
  title: string
  tracks: {
    track: Types.ObjectId
    order: number
  }[]
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
