import { AlbumModel } from "./Album"

type Populate = {
  path: string
  select: string[]
}

type PaginatedPageBasicOptions = {
  page: number
  limit: number
  sort: { [index: string]: number }
  select: { [index: string]: boolean }
  populate?: Populate | Populate[]
  lean?: boolean
}

type AlbumResponse = {
  docs: AlbumModel[]
  pagination: Pagination
}

type Pagination = {
  totalDocs: number
  totalPages: number
  page: number
}

export {
  Populate,
  PaginatedPageBasicOptions,
  AlbumResponse,
  Pagination
}
