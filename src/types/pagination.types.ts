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

export interface ListRequestConfig {
  limit: number,
  sort: SortingValue,
  page: number,
  isRandom?: true | 1
  filter?: RandomEntityReqFilter | RelatedAlbumsReqFilter
}

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
