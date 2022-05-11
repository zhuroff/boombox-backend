import 'module-alias/register'
import { Types } from 'mongoose'
import { TrackResponse } from '~/types/Track'
import { CategoryBasic } from '~/types/Category'

export class TrackDTO {  
  link: string
  title: string
  fileid: number
  duration: number
  listened: number
  artist: CategoryBasic
  _id: Types.ObjectId
  inAlbum: Types.ObjectId
  inPlaylists: Types.ObjectId[]

  constructor(track: TrackResponse) {
    this.link = track.link
    this.title = track.title
    this.fileid = track.fileid
    this.duration = track.duration
    this.listened = track.listened
    this.artist = { _id: track.artist._id, title: track.artist.title }
    this.inPlaylists = track.inPlaylists
    this._id = track._id
    this.inAlbum = track.inAlbum
  }
}
