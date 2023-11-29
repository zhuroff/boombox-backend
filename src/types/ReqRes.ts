import { Model, PaginateModel } from 'mongoose'
import { AlbumResponse } from './album.types'
import { CategoryResponse } from './category.types'

export type Populate = {
  path: string
  select: string[]
  [key: string]: unknown
}

export type ListConfig = {
  page: number
  limit: number
  sort: { [index: string]: number }
}

export type Pagination = {
  totalDocs: number
  totalPages: number
  page?: number
}

export type DiscogsPagination = {
  items: number
  page: number
  pages: number
}

export type ModelResponse = PaginateModel<any> | Model<any, {}, {}>

export type SearchPayload = {
  query: string
  key?: SearchModelKey
}

export type SearchModelKey = |
  'albums'
  | 'embedded'
  | 'artists'
  | 'genres'
  | 'periods'
  | 'collections'
  | 'playlists'
  | 'tracks'

export type SearchParams = { '$text': { '$search': string } }

export type SearchResult = {
  title: string
  key: SearchModelKey
  data: Partial<AlbumResponse | CategoryResponse>[]
}

export type SearchModel = {
  instance: ModelResponse | null
  title: string
  options: { [index: string]: boolean }
  populates?: {
    path: string
    select: string[],
    populate?: Populate
  }[] | null
}

export type SearchModelsSchema = Record<SearchModelKey, SearchModel>
