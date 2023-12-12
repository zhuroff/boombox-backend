import { CloudKeys } from '../types/cloud.types'
import { AlbumModel } from '../types/album.types'
import { BasicEntity } from '../types/common.types'
import { TrackResponse } from '../types/Track'

export class TrackDTO {
  _id: string
  title: string
  path: string
  cloudURL: CloudKeys
  duration?: number
  listened?: number
  artist: BasicEntity
  inAlbum: AlbumModel
  inPlaylists?: BasicEntity[]

  constructor(track: TrackResponse) {
    this._id = track._id
    this.title = track.title
    this.path = track.path
    this.cloudURL = track.cloudURL
    this.duration = track.duration
    this.listened = track.listened
    this.artist = track.artist
    this.inAlbum = track.inAlbum
    this.inPlaylists = track.inPlaylists
  }
}
