import { Types } from 'mongoose'

export interface CollectionUpdateProps {
  itemID: string | Types.ObjectId
  inList: boolean
  listID: string
  order?: number
}

export interface CollectionReorder {
  oldOrder: number
  newOrder: number
}
