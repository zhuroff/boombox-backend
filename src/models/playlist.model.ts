import { model, Schema } from 'mongoose'
import { PlayListModel } from '../types/Playlist'

const PlaylistSchema: Schema<PlayListModel> = new Schema({
  title: {
    type: String,
    required: true
  },

  dateCreated: {
    type: Date,
    default: Date.now
  },

  poster: {
    type: String,
    required: false
  },

  avatar: {
    type: String,
    required: false
  },

  tracks: [
    {
      track: {
        type: Schema.Types.ObjectId,
        ref: 'tracks',
        required: true
      },

      order: {
        type: Number,
        required: true
      }
    }
  ]
})

PlaylistSchema.index({ title: 'text' })
export const Playlist = model<PlayListModel>('playlists', PlaylistSchema)
