import { Model, PaginateModel } from 'mongoose'
import { AlbumResponse } from './Album'
import { CategoryResponse } from './Category'

type Populate = {
  path: string
  select: string[]
}

type ListConfig = {
  page: number
  limit: number
  sort: { [index: string]: number }
}

type PaginationOptions = ListConfig & {  
  select: { [index: string]: boolean }
  populate?: Populate | Populate[]
  lean?: boolean
}

type Pagination = {
  totalDocs: number
  totalPages: number
  page?: number
}

type ModelResponse = PaginateModel<any> | Model<any, {}, {}>

type ResponseMessage = {
  message: string | number
}

type SearchPayload = {
  query: string
  key?: SearchModelKey
}

type SearchModelKey = 'albums' | 'frames' | 'artists' | 'genres' | 'periods' | 'collections' | 'playlists'

type SearchParams = { '$text': { '$search': string } }

type SearchResult = {
  title: string
  key: SearchModelKey
  data: Partial<AlbumResponse | CategoryResponse>[]
}

type SearchModel = {
  instance: ModelResponse | null
  title: string
  options: { [index: string]: boolean }
  populates?: {
    path: string
    select: string[]
  }[] | null
}

type SearchModelsSchema = {
  [K in SearchModelKey]: SearchModel
}

export {
  Populate,
  ListConfig,
  PaginationOptions,
  Pagination,
  ModelResponse,
  ResponseMessage,
  SearchPayload,
  SearchModelKey,
  SearchParams,
  SearchResult,
  SearchModel,
  SearchModelsSchema
}
