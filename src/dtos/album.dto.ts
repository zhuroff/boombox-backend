import { AlbumResponse } from '../types/Album'
import { CategoryBasic } from '../types/Category'
import { CategoryBasicDTO } from './category.dto'
import { TrackDTO } from './track.dto'

export class AlbumItemDTO {
  _id: string
  title: string
  inCollections: CategoryBasic[]
  artist: CategoryBasicDTO
  genre: CategoryBasicDTO
  period: CategoryBasicDTO

  constructor(album: AlbumResponse, albumCover: string) {
    this._id = album._id
    this.title = album.title
    this.inCollections = album.inCollections
    this.artist = new CategoryBasicDTO(album.artist._id, album.artist.title)
    this.genre = new CategoryBasicDTO(album.genre._id, album.genre.title)
    this.period = new CategoryBasicDTO(album.period._id, album.period.title)
  }
}

export class AlbumSingleDTO extends AlbumItemDTO {
  description: string
  tracks: TrackDTO[]

  constructor(album: AlbumResponse, albumCover: string, tracks: TrackDTO[]) {
    super(album, albumCover)
    this.description = album.description
    this.tracks = tracks
  }
}
