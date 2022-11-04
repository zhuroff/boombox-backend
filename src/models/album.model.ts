import { model, Schema, PaginateModel } from 'mongoose'
import { AlbumDocument } from '../types/Album'
import paginate from 'mongoose-paginate-v2'

const AlbumSchema = new Schema({
  resource_id: {
    type: String,
    requried: true
  },

  title: {
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

  albumCover: {
    type: String,
    required: true
  },

  albumCoverArt: {
    type: String,
    required: false
  },

  modified: {
    type: Date,
    required: true
  },

  description: {
    type: String,
    required: false
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

AlbumSchema.index({ title: 'text' })
AlbumSchema.plugin(paginate)
export const Album = model<AlbumDocument, PaginateModel<AlbumDocument>>('albums', AlbumSchema)
