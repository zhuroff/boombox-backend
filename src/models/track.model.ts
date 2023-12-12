import { model, Schema, PaginateModel } from 'mongoose'
import { TrackDocument } from '../types/Track'
import paginate from 'mongoose-paginate-v2'

const TrackSchema = new Schema({
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

  inPlaylists: [
    {
      type: Schema.Types.ObjectId,
      ref: 'albums',
      required: false
    }
  ],

  artist: {
    type: Schema.Types.ObjectId,
    ref: 'artists',
    required: false
  }
})

TrackSchema.index({ title: 'text' })
TrackSchema.plugin(paginate)
export const Track = model<TrackDocument, PaginateModel<TrackDocument>>('tracks', TrackSchema)
