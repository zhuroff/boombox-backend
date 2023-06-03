import { Types } from 'mongoose'
import { UserDocument } from '../types/User'

export class UserDTO {
  id: Types.ObjectId
  name: string
  email: string
  role: string
  surname?: string
  login: string

  constructor(model: UserDocument) {
    this.id = model._id
    this.role = model.role
    this.name = model.name
    this.email = model.email
    this.surname = model.surname
    this.login = model.login
  }
}