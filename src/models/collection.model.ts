import { model, Schema, PaginateModel } from 'mongoose'
import { CollectionDocument } from '../types/collection.types'
import paginate from 'mongoose-paginate-v2'

const CollectionSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  poster: {
    type: String,
    required: false
  },
  avatar: {
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
CollectionSchema.plugin(paginate)
export const Collection = model<CollectionDocument, PaginateModel<CollectionDocument>>('collections', CollectionSchema)
