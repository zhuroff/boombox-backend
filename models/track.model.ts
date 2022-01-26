import { model, Schema } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import { TrackModelDocument, TrackModelPaginated } from '~/types/Track'

const TrackSchema: Schema<TrackModelDocument> = new Schema({
  fileid: {
    type: Number,
    required: true
  },

  dateCreated: {
    type: Date,
    default: Date.now
  },

  title: {
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
    type: Number,
    ref: 'albums',
    required: true
  },

  inPlaylists: [
    {
      type: Schema.Types.ObjectId,
      ref: 'albums',
      required: false
    }
  ]
})

TrackSchema.index({ title: 'text' })
TrackSchema.plugin(mongoosePaginate)

export const Track = model<TrackModelDocument>('tracks', TrackSchema) as TrackModelPaginated<TrackModelDocument>
