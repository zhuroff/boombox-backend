type SortingValue = Record<string, 1 | -1>

export interface RelatedAlbumsReqFilter {
  from: string
  key: string
  name: string
  excluded?: Record<string, string>
  value: string
}

export type AlbumNoteFilter = 'all' | 'withReviews' | 'withoutReviews'

export type AlbumVinylFilter = 'all' | 'onVinyl' | 'notOnVinyl'

export interface ListRequestConfig {
  limit: number
  sort: SortingValue
  page: number
  isRandom?: true | 1
  filter?: RelatedAlbumsReqFilter
  path?: string
  noteFilter?: AlbumNoteFilter
  vinylFilter?: AlbumVinylFilter
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
