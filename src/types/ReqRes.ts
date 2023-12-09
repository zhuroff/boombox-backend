import { Model, PaginateModel, PopulateOptions, ProjectionType } from 'mongoose'
import { CategoryResponse } from './category.types'
import { AlbumResponse } from './album.types'

export interface Pagination{
  totalDocs: number
  totalPages: number
  page?: number
}

export interface DiscogsPagination {
  items: number
  page: number
  pages: number
}

export interface SearchPayload {
  query: string
  key?: SearchModelKey
}

export interface RequestFilter {
  from: string
  key: string
  value: string
  excluded?: Record<string, string>
}

export type SearchModelKey =
  | 'albums'
  | 'embedded'
  | 'artists'
  | 'genres'
  | 'periods'
  | 'collections'
  | 'playlists'
  | 'tracks'

export type SearchParams = Record<'$text', { '$search': string }>

export interface SearchResult {
  key: SearchModelKey
  data: Partial<AlbumResponse | CategoryResponse>[]
}

export interface SearchConfig {
  title: string
  instance: PaginateModel<any> | Model<any>
  options: ProjectionType<Record<string, boolean>>
  populates?: PopulateOptions[]
}
