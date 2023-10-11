import { Types } from 'mongoose'
import { AlbumResponse } from './album.types'
import { TrackResponse } from './Track'

export type PlayListCreatePayload = {
  title: string
  track: string
}

export type PlayListUpdatePayload = {
  _id: string
  inList: boolean
  track: string
  order: number
}

export type PlayListTrack = {
  _id: Types.ObjectId
  track: TrackResponse
  order: number
}

export type PlaylistTrackResponse = {
  _id: Types.ObjectId
  order: number
  track: TrackResponse & { inAlbum: AlbumResponse }
}

export type PlayListModel = {
  _id: Types.ObjectId
  title: string
  dateCreated: Date
  poster?: string
  avatar?: string
  tracks: PlayListTrack[]
}

export type PlaylistResponse = {
  _id: Types.ObjectId
  title: string
  poster?: string
  cover?: string
  tracks: PlaylistTrackResponse[]
}
