import { model, Schema } from 'mongoose'
import { UserModel } from '../types/User'

const UserSchema: Schema<UserModel> = new Schema({
  login: {
    type: String,
    required: true
  },

  dateCreated: {
    type: Date,
    default: Date.now
  },

  name: {
    type: String,
    required: true
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
  },

  surname: {
    type: String,
    required: false
  }
})

export const User = model<UserModel>('users', UserSchema)
