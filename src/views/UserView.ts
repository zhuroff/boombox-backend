import { Types } from 'mongoose'
import { UserDocument } from '../models/user.model'

export default class UserView {
  _id: Types.ObjectId
  email: string
  role: string
  login: string

  constructor(model: UserDocument) {
    this._id = model._id
    this.role = model.role
    this.email = model.email
    this.login = model.login
  }
}
