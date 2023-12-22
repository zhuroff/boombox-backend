import { DiscogsPagination, Pagination } from '../types/reqres.types'

export class PaginationDTO {
  totalDocs: number
  totalPages: number
  page?: number

  constructor(pagination: Pagination | DiscogsPagination) {
    if ('totalDocs' in pagination) {
      this.totalDocs = pagination.totalDocs
      this.totalPages = pagination.totalPages
      this.page = pagination.page || 1
    } else {
      this.totalDocs = pagination.items
      this.totalPages = pagination.pages
      this.page = pagination.page
    }
  }
}
