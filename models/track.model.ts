import 'module-alias/register'
import { model, Schema, PaginateModel } from 'mongoose'
import { TrackDocument } from '~/types/Track'
import paginate from 'mongoose-paginate-v2'

const TrackSchema = new Schema({
  resource_id: {
    type: String,
    required: true
  },

  title: {
    type: String,
    required: true,
    index: true
  },

  dateCreated: {
    type: Date,
    default: Date.now
  },

  created: {
    type: String,
    required: true
  },

  path: {
    type: String,
    required: true
  },

  mime_type: {
    type: String,
    required: true
  },

  media_type: {
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

TrackSchema.plugin(paginate)
export const Track = model<TrackDocument, PaginateModel<TrackDocument>>('tracks', TrackSchema)
