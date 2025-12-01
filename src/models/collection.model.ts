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
      album: {
        ref: 'albums',
        type: Schema.Types.ObjectId,
        required: false
      },
      order: {
        type: Number,
        required: true
      },
      post: {
        type: String,
        required: false
      }
    }
  ]
})

schema.index({ title: 'text' })
schema.plugin(paginate)

export interface CollectionDocumentAlbum {
  album: AlbumDocument | Types.ObjectId
  order: number
  post?: string
}

export interface CollectionDocument extends Omit<
  InferSchemaType<typeof schema> & { _id: Types.ObjectId },
  'albums'
> {
  albums: CollectionDocumentAlbum[]
}

export const Collection = model<CollectionDocument, PaginateModel<CollectionDocument>>('collections', schema)
