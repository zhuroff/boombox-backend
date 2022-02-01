import { model, Schema } from 'mongoose'
import { IPlayListModel } from '~/types/Playlist'

const PlaylistSchema: Schema<IPlayListModel> = new Schema({
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

  cover: {
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

export const Playlist = model<IPlayListModel>('playlists', PlaylistSchema)
