import { model, Schema } from 'mongoose'
import { ICollectionAlbum } from '~/types/Collection'

const CollectionSchema: Schema<ICollectionAlbum> = new Schema({
  title: {
    type: String,
    required: true
  },

  dateCreated: {
    type: Date,
    default: Date.now
  },

  cover: {
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

export const Collection = model<ICollectionAlbum>('collections', CollectionSchema)
