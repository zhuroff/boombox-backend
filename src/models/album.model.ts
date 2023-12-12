import { model, Schema, PaginateModel } from 'mongoose'
import { AlbumDocument } from '../types/album.types'
import paginate from 'mongoose-paginate-v2'

const AlbumSchema = new Schema({
  title: {
    type: String,
    required: true
  },

  folderName: {
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

AlbumSchema.index({ title: 'text' })
AlbumSchema.plugin(paginate)
export const Album = model<AlbumDocument, PaginateModel<AlbumDocument>>('albums', AlbumSchema)
