import { DiscogsPagination, Pagination } from '../types/reqres.types'

class PaginationView {
  totalDocs: number
  totalPages: number
  page?: number

  constructor(totalDocs: number, totalPages: number, page?: number) {
    this.totalDocs = totalDocs
    this.totalPages = totalPages
    this.page = page
  }
}

export default class PaginationViewFactory {
  static isDiscogsPagination(pagination: Pagination | DiscogsPagination): pagination is DiscogsPagination {
    return 'items' in pagination
  }

  static create(pagination: Pagination | DiscogsPagination): PaginationView {
    if (this.isDiscogsPagination(pagination)) {
      return new PaginationView(
        pagination.items,
        pagination.pages,
        pagination.page
      )
    }

    return new PaginationView(
      pagination.totalDocs,
      pagination.totalPages,
      pagination.page
    )
  }
}
