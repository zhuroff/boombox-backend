import 'module-alias/register'
import { CategoryBasic } from '~/types/Category'
import { TrackResponse } from '~/types/Track'

export class TrackDTO {
  _id: string
  title: string
  link: string
  mime_type: string
  media_type: string
  duration?: number
  listened?: number
  artist: CategoryBasic
  inAlbum: CategoryBasic
  inPlaylists?: CategoryBasic[]

  constructor(track: TrackResponse) {
    this._id = track._id
    this.title = track.title
    this.link = track.file
    this.mime_type = track.mime_type
    this.media_type = track.media_type
    this.duration = track.duration
    this.listened = track.listened
    this.artist = track.artist
    this.inPlaylists = track.inPlaylists
    this.inAlbum = track.inAlbum
  }
}
