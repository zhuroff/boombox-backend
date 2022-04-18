import { Types } from 'mongoose'

type PlayListTrack = {
  _id: Types.ObjectId
  track: Types.ObjectId
  order: number
}

type PlayListModel = {
  _id: Types.ObjectId
  title: string
  dateCreated: Date
  poster?: string
  cover?: string
  tracks: PlayListTrack[]
}

export {
  PlayListTrack,
  PlayListModel,
  // PlaylistResponse
}
