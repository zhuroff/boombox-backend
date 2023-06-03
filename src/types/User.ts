import { Document } from 'mongoose'
import { UserDTO } from '../dtos/user.dto'

export type UserRoles = 'admin' | 'listener'

export type User = {
  login: string
  name: string
  email: string
  password: string
  role: UserRoles
  surname?: string
}

export type UserModel = User & {
  dateCreated: Date
}

export type UserResponse = {
  user: UserDTO;
  accessToken: string;
  refreshToken: string;
}

export interface UserDocument extends Document, UserModel { }
