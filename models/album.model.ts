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
  ]
})

AlbumSchema.index({ title: 'text' })
AlbumSchema.plugin(mongoosePaginate)

export const Album = model<AlbumModelDocument>('albums', AlbumSchema) as AlbumModelPaginated<AlbumModelDocument>
