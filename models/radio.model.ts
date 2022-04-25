import { model, Schema } from 'mongoose'
import { RadioModel } from '~/types/Radio'

const RadioSchema: Schema<RadioModel> = new Schema({
  name: {
    type: String,
    required: true
  },

  stationuuid: {
    type: String,
    required: true
  },

  dateCreated: {
    type: Date,
    default: Date.now
  },
})

export const Radio = model<RadioModel>('radio', RadioSchema)
