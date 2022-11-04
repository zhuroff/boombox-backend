import { Types } from 'mongoose'
import { AlbumResponse } from './Album'
import { TrackResponse } from './Track'

type PlayListCreatePayload = {
  title: string
  track: string
}

type PlayListUpdatePayload = {
  _id: string
  inList: boolean
  track: string
  order: number
}

type PlayListTrack = {
  _id: Types.ObjectId
  track: TrackResponse
  order: number
}

type PlaylistTrackResponse = {
  _id: Types.ObjectId
  order: number
  track: TrackResponse & { inAlbum: AlbumResponse }
}

type PlayListModel = {
  _id: Types.ObjectId
  title: string
  dateCreated: Date
  poster?: string
  avatar?: string
  tracks: PlayListTrack[]
}

type PlaylistResponse = {
  _id: Types.ObjectId
  title: string
  poster?: string
  cover?: string
  tracks: PlaylistTrackResponse[]
}

export {
  PlayListCreatePayload,
  PlayListUpdatePayload,
  PlayListTrack,
  PlaylistTrackResponse,
  PlayListModel,
  PlaylistResponse
}
