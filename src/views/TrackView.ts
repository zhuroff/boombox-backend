import { TrackDocument } from '../models/track.model'
import { AlbumDocument } from '../models/album.model'
import EntityBasicView from '../views/BasicEntityView'

export default class TrackView {
  _id: string
  title: string
  path?: string
  cloudURL: string
  cloudId: string
  duration?: number | null
  listened?: number | null
  period: EntityBasicView
  genre: EntityBasicView
  artist: EntityBasicView
  inAlbum: AlbumDocument
  inCompilations?: EntityBasicView[]
  coverURL?: string

  constructor(track: TrackDocument) {
    this._id = track._id.toString()
    this.cloudId = track.cloudId
    this.title = track.title
    this.cloudURL = track.cloudURL
    this.duration = track.duration
    this.listened = track.listened
    this.period = track.period
    this.genre = track.genre
    this.artist = track.artist
    this.inAlbum = track.inAlbum
    this.inCompilations = track.inCompilations
    this.coverURL = track.coverURL

    if (track.path) {
      this.path = track.path
    }
  }
}
