import { InferSchemaType, model, Schema, Types } from 'mongoose'

const schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  refreshToken: {
    type: String,
    required: true
  }
})

export type TokenDocument = InferSchemaType<typeof schema> & { _id: Types.ObjectId }

export const Token = model<TokenDocument>('tokens', schema)