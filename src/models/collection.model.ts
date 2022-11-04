import { model, Schema } from 'mongoose'
import { CollectionModel } from '../types/Collection'

const CollectionSchema: Schema<CollectionModel> = new Schema({
  title: {
    type: String,
    required: true
  },

  dateCreated: {
    type: Date,
    default: Date.now
  },

  avatar: {
    type: String,
    required: false
  },

  poster: {
    type: String,
    required: false
  },

  albums: [
    {
      album: {
        ref: 'albums',
        type: Schema.Types.ObjectId,
        required: false
      },

      order: {
        type: Number,
        required: true
      }
    }
  ]
})

CollectionSchema.index({ title: 'text' })
export const Collection = model<CollectionModel>('collections', CollectionSchema)
