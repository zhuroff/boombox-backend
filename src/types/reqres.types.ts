import { Model, PaginateModel, PopulateOptions, ProjectionType } from 'mongoose'
import { TrackDocument } from '../models/track.model'
import { CategoryDocument, ModelKeys } from './common.types'
import { UserDTO } from '../dto/user.dto'
import { AlbumItemDTO } from '../dto/album.dto'
import { CloudFileTypes } from './cloud.types'

type SortingValue = Record<string, 1 | -1>

export interface RandomEntityReqFilter {
  from: string
  key: string
  name: string
  excluded?: Record<string, string>
}

export interface RelatedAlbumsReqFilter extends RandomEntityReqFilter {
  value: string
}

export interface Pagination {
  totalDocs: number
  totalPages: number
  page?: number
}

export interface ListRequestConfig {
  limit: number,
  sort: SortingValue,
  page: number,
  isRandom?: true
  filter?: RandomEntityReqFilter | RelatedAlbumsReqFilter
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
