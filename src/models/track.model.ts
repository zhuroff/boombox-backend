import { model, Schema, PaginateModel, InferSchemaType, Types } from 'mongoose'
import { AlbumDocument } from './album.model'
import { ArtistDocument } from './artist.model'
import { CompilationDocument } from './compilation.model'
import { GenreDocument } from './genre.model'
import { PeriodDocument } from './period.model'
import paginate from 'mongoose-paginate-v2'

type TrackObjectIdKeys = 'inAlbum' | 'inCompilations' | 'artist' | 'genre' | 'period'

const schema = new Schema({
  title: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  cloudURL: {
    type: String,
    required: true
  },
  cloudId: {
    type: String,
    required: true
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  created: {
    type: Date,
    required: true
  },
  modified: {
    type: Date,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  lyrics: {
    type: String,
    required: false
  },
  duration: {
    type: Number,
    required: false
  },
  listened: {
    type: Number,
    required: false,
    default: 0
  },
  inAlbum: {
    type: Schema.Types.ObjectId,
    ref: 'albums',
    required: true
  },
  inCompilations: [
    {
      type: Schema.Types.ObjectId,
      ref: 'compilations',
      required: false
    }
  ],
  artist: {
    type: Schema.Types.ObjectId,
    ref: 'artists',
    required: false
  },
  genre: {
    type: Schema.Types.ObjectId,
    ref: 'genres',
    required: false
  },
  period: {
    type: Schema.Types.ObjectId,
    ref: 'periods',
    required: false
  }
})

schema.index({ title: 'text' })
schema.plugin(paginate)

export interface TrackDocument extends Omit<
  InferSchemaType<typeof schema> & { _id: Types.ObjectId },
  TrackObjectIdKeys
> {
  coverURL?: string
  inAlbum: AlbumDocument
  inCompilations: CompilationDocument[]
  artist: ArtistDocument
  genre: GenreDocument
  period: PeriodDocument
}

export const Track = model<TrackDocument, PaginateModel<TrackDocument>>('tracks', schema)
