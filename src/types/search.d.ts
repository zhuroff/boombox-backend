import { Model, PaginateModel, PopulateOptions, ProjectionType } from 'mongoose'
import { TrackDocument } from '../models/track.model'
import { CategoryDocument } from './category'
import { AlbumItem } from './album'

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

export interface SearchPayload {
  query: string
  key?: SearchModelKey
}

export type SearchModelKey = Omit<ModelKeys, 'users' | 'tokens' | 'toys'>

export type SearchParams = Record<'$text', { '$search': string }>

export interface SearchResult {
  key: SearchModelKey
  data: Partial<CategoryDocument | TrackDocument | AlbumItem>[]
}

export interface SearchConfig {
  instance: PaginateModel<any> | Model<any>
  options: ProjectionType<Record<string, boolean>>
  populates?: PopulateOptions[]
}

export interface SearchRepository {
  splitSearch(payload: SearchPayload, config?: SearchConfig): Promise<TrackDocument[] | CategoryDocument[] | AlbumItem[]>
  searchEntry<T>(params: SearchParams, Model: SearchConfig): Promise<T>
}
