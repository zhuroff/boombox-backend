import { InferSchemaType, model, Schema, Types } from 'mongoose'

const schema = new Schema({
  login: {
    type: String,
    required: true
  },
  dateCreated: {
    type: Date,
    default: Date.now
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  }
})

export type UserDocument = InferSchemaType<typeof schema> & { _id: Types.ObjectId }

export const User = model<UserDocument>('users', schema)
