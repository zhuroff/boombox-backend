import { Model, PaginateModel } from 'mongoose'
import { AlbumResponse } from './album.types'
import { CategoryResponse } from './Category'

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

export type PaginationOptions = ListConfig & {
  select: { [index: string]: boolean }
  populate?: Populate | Populate[]
  lean?: boolean
}

export type Pagination = {
  totalDocs: number
  totalPages: number
  page?: number
}

export type ModelResponse = PaginateModel<any> | Model<any, {}, {}>

export type SearchPayload = {
  query: string
  key?: SearchModelKey
}

export type SearchModelKey = 'albums' | 'embedded' | 'artists' | 'genres' | 'periods' | 'collections' | 'playlists'

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
    select: string[]
  }[] | null
}

export type SearchModelsSchema = Record<SearchModelKey, SearchModel>
