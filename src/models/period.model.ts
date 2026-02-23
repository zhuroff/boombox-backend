import { model, Schema, PaginateModel, InferSchemaType, Types } from 'mongoose'
import { AlbumDocument } from './album.model'
import paginate from 'mongoose-paginate-v2'

const schema = new Schema({
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
  ]
})

schema.index({ title: 'text' })
schema.index({ title: 1 }, { unique: true })
schema.plugin(paginate)

export interface PeriodDocument extends Omit<
  InferSchemaType<typeof schema> & { _id: Types.ObjectId },
  'albums'
> {
  albums: AlbumDocument[]
}

export const Period = model<PeriodDocument, PaginateModel<PeriodDocument>>('periods', schema)
