import { AlbumResponse } from '../types/Album'
import { CategoryBasic } from '../types/Category'
import { TrackDTO } from '../dtos/track.dto'

export class AlbumItemDTO {
  _id: string
  title: string
  albumCover: string
  inCollections: CategoryBasic[]
  artist: CategoryBasic
  genre: CategoryBasic
  period: CategoryBasic

  constructor(album: AlbumResponse, albumCover: string) {
    this._id = album._id
    this.title = album.title
    this.albumCover = albumCover
    this.inCollections = album.inCollections
    this.artist = album.artist
    this.genre = album.genre
    this.period = album.period
  }
}

export class AlbumSingleDTO extends AlbumItemDTO {
  albumCoverArt?: string
  description: string
  tracks: TrackDTO[]

  constructor(album: AlbumResponse, albumCover: string, tracks: TrackDTO[]) {
    super(album, albumCover)
    this.albumCoverArt = album.albumCoverArt
    this.description = album.description
    this.tracks = tracks
  }
}
