import { AlbumDocument } from '../models/album.model'
import { BasicEntity } from '../types/common.types'
import { EntityBasicDTO } from './basic.dto'
import { TrackDTO } from './track.dto'

export class AlbumItemDTO {
  _id: string
  title: string
  cloudURL: string
  folderName: string
  inCollections: BasicEntity[]
  artist: EntityBasicDTO
  genre: EntityBasicDTO
  period: EntityBasicDTO
  coverURL?: string

  constructor(album: AlbumDocument, albumCover?: string) {
    this._id = album._id.toString()
    this.title = album.title
    this.artist = new EntityBasicDTO(album.artist._id, album.artist.title)
    this.genre = new EntityBasicDTO(album.genre._id, album.genre.title)
    this.period = new EntityBasicDTO(album.period._id, album.period.title)
    this.inCollections = album.inCollections.map((collection) => (
      new EntityBasicDTO(collection._id, collection.title)
    ))
    this.coverURL = albumCover
    this.cloudURL = album.cloudURL
    this.folderName = album.folderName
  }
}

export class AlbumPageDTO extends AlbumItemDTO {
  tracks: TrackDTO[]

  constructor(album: AlbumDocument, albumCover?: string) {
    super(album, albumCover)
    this.tracks = album.tracks.map((track) => new TrackDTO(track))
  }
}
