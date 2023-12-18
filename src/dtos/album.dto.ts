import { CloudKeys } from '../types/cloud.types'
import { AlbumResponse } from '../types/album.types'
import { BasicEntity } from '../types/common.types'
import { EntityBasicDTO } from './basic.dto'
import { TrackDTO } from './track.dto'

export class AlbumItemDTO {
  _id: string
  title: string
  cloudURL: CloudKeys
  folderName: string
  inCollections: BasicEntity[]
  artist: EntityBasicDTO
  genre: EntityBasicDTO
  period: EntityBasicDTO
  coverURL?: string

  constructor(album: AlbumResponse, albumCover?: string) {
    this._id = album._id
    this.title = album.title
    this.inCollections = album.inCollections
    this.artist = new EntityBasicDTO(album.artist._id, album.artist.title)
    this.genre = new EntityBasicDTO(album.genre._id, album.genre.title)
    this.period = new EntityBasicDTO(album.period._id, album.period.title)
    this.coverURL = albumCover
    this.cloudURL = album.cloudURL
    this.folderName = album.folderName
  }
}

export class AlbumSingleDTO extends AlbumItemDTO {
  tracks: TrackDTO[]

  constructor(album: AlbumResponse, tracks: TrackDTO[], albumCover?: string) {
    super(album, albumCover)
    this.tracks = tracks
  }
}
