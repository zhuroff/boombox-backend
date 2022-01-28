import { Types } from 'mongoose'

interface ICollectionAlbum {
  title: string
  dateCreated: Date
  cover: string
  poster: string
  albums: {
    _id: Types.ObjectId
    album: Types.ObjectId
    order: number
  }[]
}

export {
  ICollectionAlbum
}
