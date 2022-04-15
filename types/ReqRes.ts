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

type ResponseMessage = {
  message: string | number
}

export {
  Populate,
  ListConfig,
  PaginationOptions,
  Pagination,
  ResponseMessage
}
