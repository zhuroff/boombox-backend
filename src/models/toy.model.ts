import { model, Schema } from 'mongoose';
import { TOYDocument } from '../types/TOY';

const TOYSchema = new Schema({
  dateCreated: {
    type: Date,
    default: Date.now
  },

  folderId: {
    type: String,
    required: true
  },

  preface: {
    type: String,
    required: false
  },

  afterword: {
    type: String,
    required: false
  },

  tracks: [
    {
      trackId: {
        type: String,
        required: true
      },

      description: {
        type: String,
        required: false
      },

      iframe: {
        type: String,
        required: false
      }
    }
  ]
})

export const TOYPage = model<TOYDocument>('toys', TOYSchema)
