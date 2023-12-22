import { BasicEntity } from '../types/common.types'
import { TrackDocument } from '../models/track.model'
import { AlbumDocument } from 'src/models/album.model'

export class TrackDTO {
  _id: string
  title: string
  path: string
  cloudURL: string
  duration?: number
  listened?: number
  artist: BasicEntity
  inAlbum: AlbumDocument
  inCompilations?: BasicEntity[]

  constructor(track: TrackDocument) {
    this._id = track._id.toString()
    this.title = track.title
    this.path = track.path
    this.cloudURL = track.cloudURL
    this.duration = track.duration
    this.listened = track.listened
    this.artist = track.artist
    this.inAlbum = track.inAlbum
    this.inCompilations = track.inCompilations
  }
}
