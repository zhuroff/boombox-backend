import 'module-alias/register'
import { Types } from 'mongoose'
import { AlbumResponse } from '~/types/Album'
import { CategoryBasic } from '~/types/Category'
import { TrackDTO } from '~/dtos/track.dto'

export class AlbumItemDTO {
  _id: Types.ObjectId
  title: string
  albumCover: string | number
  inCollections: Types.ObjectId[]
  artist: CategoryBasic
  genre: CategoryBasic
  period: CategoryBasic

  constructor(album: AlbumResponse) {
    this._id = album._id
    this.title = album.title
    this.albumCover = album.albumCover
    this.inCollections = album.inCollections
    this.artist = { _id: album.artist._id, title: album.artist.title }
    this.genre = { _id: album.genre._id, title: album.genre.title }
    this.period = { _id: album.period._id, title: album.period.title }
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
