import { AlbumDocument } from '../models/album.model'
import { BasicEntity } from '../types/common.types'
import { EntityBasicDTO } from './basic.dto'
import { TrackDTO } from './track.dto'

export class AlbumItemDTO extends EntityBasicDTO {
  folderName: string
  inCollections: BasicEntity[]
  artist: EntityBasicDTO
  genre: EntityBasicDTO
  period: EntityBasicDTO
  coverURL?: string

  constructor(album: AlbumDocument, albumCover?: string) {
    super(album._id, album.title, album.cloudURL)
    this.artist = new EntityBasicDTO(album.artist._id, album.artist.title, album.cloudURL)
    this.genre = new EntityBasicDTO(album.genre._id, album.genre.title, album.cloudURL)
    this.period = new EntityBasicDTO(album.period._id, album.period.title, album.cloudURL)
    this.coverURL = albumCover || album.cover
    this.folderName = album.folderName
    this.inCollections = album.inCollections?.map((collection) => (
      new EntityBasicDTO(collection._id, collection.title)
    )) || []
  }
}

export class AlbumPageDTO extends AlbumItemDTO {
  tracks: TrackDTO[]

  constructor(album: AlbumDocument, albumCover?: string) {
    super(album, albumCover)
    this.tracks = album.tracks.map((track) => new TrackDTO(track, album.period))
  }
}
