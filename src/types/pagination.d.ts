type SortingValue = Record<string, 1 | -1>

export interface RelatedAlbumsReqFilter {
  from: string
  key: string
  name: string
  excluded?: Record<string, string>
  value: string
}

export interface ListRequestConfig {
  limit: number
  sort: SortingValue
  page: number
  isRandom?: true | 1
  filter?: RelatedAlbumsReqFilter
  path?: string
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
