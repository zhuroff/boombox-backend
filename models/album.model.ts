import { model, Schema } from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import { AlbumModelDocument, AlbumModelPaginated } from '~/types/Album'

const AlbumSchema: Schema<AlbumModelDocument> = new Schema({
  title: {
    type: String,
    required: true
  },

  artist: {
    type: Schema.Types.ObjectId,
    ref: 'artists',
    required: false
  },

  genres: [{
    type: Schema.Types.ObjectId,
    ref: 'genres',
    required: false
  }],

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
    type: Number,
    required: true
  },

  albumCoverArt: {
    type: Number,
    required: false
  },

  folderid: {
    type: Number,
    required: true
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
      fileid: {
        type: Number,
        required: true
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
      }
    }
  ]
})

AlbumSchema.index({ title: 'text' })
AlbumSchema.plugin(mongoosePaginate)

export const Album = model<AlbumModelDocument>('albums', AlbumSchema) as AlbumModelPaginated<AlbumModelDocument>
