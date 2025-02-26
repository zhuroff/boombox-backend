import { Model, PaginateModel, PopulateOptions, ProjectionType } from 'mongoose'
import { TrackDocument } from '../models/track.model'
import { CategoryDocument, ModelKeys } from './common.types'
import { UserDTO } from '../dto/user.dto'
import { AlbumItemDTO } from '../dto/album.dto'
import { CloudFileTypes } from './cloud.types'

export interface Pagination {
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

export type SearchModelKey = Omit<ModelKeys, 'users' | 'tokens' | 'toys'>

export type SearchParams = Record<'$text', { '$search': string }>

export interface SearchResult {
  key: SearchModelKey
  data: Partial<AlbumItemDTO | CategoryDocument | TrackDocument>[]
}

export interface SearchConfig {
  instance: PaginateModel<any> | Model<any>
  options: ProjectionType<Record<string, boolean>>
  populates?: PopulateOptions[]
}

export interface UserResponse {
  user: UserDTO
  accessToken: string
  refreshToken: string
}

export interface CloudReqPayload {
  id: string
  path: string
  cloudURL: string
}

export interface CloudReqPayloadFilter extends CloudReqPayload {
  type?: CloudFileTypes
  cluster?: string
  limit?: number
  offset?: number
}
