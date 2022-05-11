import 'module-alias/register'
import { model, PaginateModel, Schema } from 'mongoose'
import { AlbumModel } from '~/types/Album'
import mongoosePaginate from 'mongoose-paginate-v2'

const AlbumSchema: Schema<AlbumModel> = new Schema({
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
AlbumSchema.plugin(mongoosePaginate)

export const Album = model<AlbumModel, PaginateModel<AlbumModel>>('albums', AlbumSchema)
