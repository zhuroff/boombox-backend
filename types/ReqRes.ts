type Populate = {
  path: string
  select: string[]
}

type PaginationOptions = {
  page: number
  limit: number
  sort: { [index: string]: number }
  select: { [index: string]: boolean }
  populate?: Populate | Populate[]
  lean?: boolean
}

type Pagination = {
  totalDocs: number
  totalPages: number
  page?: number
}

type ResponseMessage = {
  message: string | number
}

export {
  Populate,
  PaginationOptions,
  Pagination,
  ResponseMessage
}
