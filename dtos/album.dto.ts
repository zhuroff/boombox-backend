import { PaginateDocument, Types } from 'mongoose'
import { AlbumResponse } from '~/types/Album'
import { CategoryBasic } from '~/types/Category'
import { Pagination } from '~/types/ReqRes'
import { TrackDTO } from '~/dtos/track.dto'

export class AlbumListDTO {
  pagination: Pagination = {
    totalDocs: 0,
    totalPages: 1,
    page: 1
  }

  docs = [] as AlbumResponse[]

  constructor(model: PaginateDocument<unknown, any, AlbumResponse>, albums: AlbumResponse[]) {
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
  title: string
  artist: CategoryBasic
  genre: CategoryBasic
  period: CategoryBasic
  albumCoverArt: number
  folderid: number
  description: string
  _id: Types.ObjectId
  tracks: TrackDTO[]
  albumCover: string | number
  inCollections: Types.ObjectId[]

  constructor(album: AlbumResponse, albumCover: string | number, tracks: TrackDTO[]) {
    this._id = album._id
    this.title = album.title
    this.artist = { _id: album.artist._id, title: album.artist.title }
    this.genre = { _id: album.genre._id, title: album.genre.title }
    this.period = { _id: album.period._id, title: album.period.title }
    this.albumCover = albumCover
    this.albumCoverArt = album.albumCoverArt
    this.folderid = album.folderid
    this.description = album.description
    this.tracks = tracks
    this.inCollections = album.inCollections
  }
}
