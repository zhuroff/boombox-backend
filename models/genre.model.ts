import 'module-alias/register'
import { model, Schema } from 'mongoose'
import { CategoryModel, ICategory } from '~/types/Category'
import mongoosePaginate from 'mongoose-paginate-v2'

const GenreSchema: Schema = new Schema({
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
GenreSchema.plugin(mongoosePaginate)

export const Genre = model<CategoryModel>('genres', GenreSchema) as ICategory<CategoryModel>
