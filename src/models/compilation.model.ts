import { InferSchemaType, model, PaginateModel, Schema, Types } from 'mongoose'
import { TrackDocument } from './track.model'
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
  tracks: [
    {
      track: {
        type: Schema.Types.ObjectId,
        ref: 'tracks',
        required: true
      },
      order: {
        type: Number,
        required: true
      }
    }
  ]
})

schema.index({ title: 'text' })
schema.plugin(paginate)

export interface CompilationDocumentAlbum {
  album: TrackDocument | Types.ObjectId
  order: number
}

export interface CompilationDocument extends Omit<
  InferSchemaType<typeof schema> & { _id: Types.ObjectId },
  'tracks'
> {
  tracks: CompilationDocumentAlbum[]
}

export const Compilation = model<CompilationDocument, PaginateModel<CompilationDocument>>('compilations', schema)
