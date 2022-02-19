import { PaginateDocument } from 'mongoose'
import { AlbumModel } from '~/types/Album'
import { AlbumResponse, Pagination } from '~/types/ReqRes'

export class AlbumListDTO {
  pagination: Pagination = {
    totalDocs: 0,
    totalPages: 1,
    page: 1
  }

  docs = [] as AlbumModel[]

  constructor(model: PaginateDocument<unknown, any, AlbumResponse>, albums: AlbumModel[]) {
    const { totalDocs, totalPages, page } = model

    this.pagination = {
      totalDocs,
      totalPages,
      page
    }

    this.docs = albums
  }
}

export class AlbumSingleDTO {

}
