import { Types } from 'mongoose'
import { PlayListTrack, PlayListModel } from '~/types/Playlist'

export class PlaylistItemDTO {
  _id: Types.ObjectId
  title: string
  poster?: string
  cover?: string
  tracks: PlayListTrack[]

  constructor(playlist: PlayListModel) {
    this._id = playlist._id
    this.title = playlist.title
    this.tracks = playlist.tracks
    this.cover = playlist.cover
    this.poster = playlist.poster
  }
}
