import { BasicEntity } from '../types/common.types'
import { TrackDocument } from '../models/track.model'
import { AlbumDocument } from '../models/album.model'

export class TrackDTO {
  _id: string
  title: string
  path: string
  cloudURL: string
  cloudId: string
  duration?: number | null
  listened?: number | null
  period: BasicEntity
  genre: BasicEntity
  artist: BasicEntity
  inAlbum: AlbumDocument
  inCompilations?: BasicEntity[]
  coverURL?: string

  constructor(track: TrackDocument) {
    this._id = track._id.toString()
    this.cloudId = track.cloudId
    this.title = track.title
    this.path = track.path
    this.cloudURL = track.cloudURL
    this.duration = track.duration
    this.listened = track.listened
    this.period = track.period
    this.genre = track.genre
    this.artist = track.artist
    this.inAlbum = track.inAlbum
    this.inCompilations = track.inCompilations
    this.coverURL = track.coverURL
  }
}
