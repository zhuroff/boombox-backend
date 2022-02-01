import { Types } from 'mongoose'

interface IPlayListTrack {
  track: Types.ObjectId
  order: number
}

interface IPlayListModel {
  _id?: Types.ObjectId
  title: string
  dateCreated: Date
  poster: string
  cover: string
  tracks: IPlayListTrack[]
}

export {
  IPlayListModel
}
