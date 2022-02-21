import { PaginateDocument } from 'mongoose'
import { AlbumModel } from '~/types/Album'
import { AlbumResponse, Pagination } from '~/types/ReqRes'
import { TrackModel } from '~/types/Track'

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
  album = {} as AlbumModel

  constructor(model: AlbumModel, albumCover: string | 0, tracks: TrackModel[]) {
    this.album = { ...model, albumCover, tracks }
  }
}
