import { Pagination } from "~/types/ReqRes"

export class PaginationDTO {
  totalDocs: number
  totalPages: number
  page?: number

  constructor({ totalDocs, totalPages, page }: Pagination) {
    this.totalDocs = totalDocs
    this.totalPages = totalPages
    this.page = page || 1
  }
}
