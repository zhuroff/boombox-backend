import 'module-alias/register'
import { Types } from 'mongoose'
import { PlayListTrack, PlayListModel, PlaylistTrackResponse } from '~/types/Playlist'

export class PlaylistItemDTO {
  _id: Types.ObjectId
  title: string
  tracks: PlayListTrack[] | PlaylistTrackResponse[]
  poster?: string
  avatar?: string

  constructor(playlist: PlayListModel) {
    this._id = playlist._id
    this.title = playlist.title
    this.tracks = playlist.tracks
    this.avatar = playlist.avatar
    this.poster = playlist.poster
  }
}
