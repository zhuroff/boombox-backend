import { InferSchemaType, model, Schema, Types } from 'mongoose'

const schema = new Schema({
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

export type RadioDocument = InferSchemaType<typeof schema> & { _id: Types.ObjectId }

export const Radio = model<RadioDocument>('radio', schema)
