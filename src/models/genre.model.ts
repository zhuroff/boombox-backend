import { model, Schema, PaginateModel } from 'mongoose'
import { CategoryDocument } from '../types/Category'
import paginate from 'mongoose-paginate-v2'

const GenreSchema = new Schema({
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
      ref: 'albums',
      type: Schema.Types.ObjectId,
      required: false
    }
  ],

  framesAlbums: [
    {
      ref: 'frames',
      type: Schema.Types.ObjectId,
      required: false
    }
  ]
})

GenreSchema.index({ title: 'text' })
GenreSchema.plugin(paginate)
export const Genre = model<CategoryDocument, PaginateModel<CategoryDocument>>('genres', GenreSchema)
