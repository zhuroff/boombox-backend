import { model, Schema } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import { CategoryModel, ICategory } from '~/types/Category'

const PeriodSchema: Schema = new Schema({
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

PeriodSchema.index({ title: 'text' })
PeriodSchema.plugin(mongoosePaginate)

export const Period = model<CategoryModel>('periods', PeriodSchema) as ICategory<CategoryModel>
