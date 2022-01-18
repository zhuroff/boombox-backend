import { model, Schema } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import { CategoryModel, ICategory } from '~/types/Category'

const ArtistSchema: Schema = new Schema({
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

ArtistSchema.index({ title: 'text' })
ArtistSchema.plugin(mongoosePaginate)

export const Artist = model<CategoryModel>('artists', ArtistSchema) as ICategory<CategoryModel>
