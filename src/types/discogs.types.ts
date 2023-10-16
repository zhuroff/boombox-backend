export type DiscorsResponseItem = {
  barcode: string[]
  catno: string
  country: string
  cover_image: string
  format: string[]
  genre: string[]
  id: number
  label: string[]
  master_url: string
  resource_url: string
  uri: string
  style: string[]
  title: string
  year: string
}

export type DiscogsResponsePagination = {
  items: number
  page: number
  pages: number
  per_page: number
}

export type DiscogsResponse = {
  pagination: DiscogsResponsePagination
  results: DiscorsResponseItem[]
}
