import { CategoryBasic } from '../types/Category'
import { TrackResponse } from '../types/Track'

export class TrackDTO {
  _id: string
  title: string
  path: string
  duration?: number
  listened?: number
  artist: CategoryBasic
  inAlbum: CategoryBasic
  inPlaylists?: CategoryBasic[]

  constructor(track: TrackResponse) {
    this._id = track._id
    this.title = track.title
    this.path = track.path
    this.duration = track.duration
    this.listened = track.listened
    this.artist = track.artist
    this.inAlbum = track.inAlbum
    this.inPlaylists = track.inPlaylists
  }
}