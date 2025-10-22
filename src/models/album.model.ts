import { model, Schema, PaginateModel, InferSchemaType, Types } from 'mongoose'
import { TrackDocument } from './track.model'
import { ArtistDocument } from './artist.model'
import { GenreDocument } from './genre.model'
import { PeriodDocument } from './period.model'
import { CollectionDocument } from './collection.model'
import paginate from 'mongoose-paginate-v2'

type AlbumObjectIdKeys = 'artist' | 'genre' | 'period' | 'tracks' | 'inCollections'

const schema = new Schema({
  title: {
    type: String,
    required: true
  },
  cloudId: {
    type: String,
    required: true
  },
  folderName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  cloudURL: {
    type: String,
    required: true
  },
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
  tracks: [
    {
      type: Schema.Types.ObjectId,
      ref: 'tracks',
      required: false
    }
  ],
  inCollections: [
    {
      type: Schema.Types.ObjectId,
      ref: 'collections',
      required: false
    }
  ]
})

schema.index({ title: 'text' })
schema.plugin(paginate)

export interface AlbumDocument extends Omit<
  InferSchemaType<typeof schema> & { _id: Types.ObjectId },
  AlbumObjectIdKeys
> {
  cover?: string
  artist: ArtistDocument
  genre: GenreDocument
  period: PeriodDocument
  tracks: TrackDocument[]
  inCollections: CollectionDocument[]
}

export const Album = model<AlbumDocument, PaginateModel<AlbumDocument>>('albums', schema)
