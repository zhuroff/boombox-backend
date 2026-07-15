import { Types, QueryFilter } from 'mongoose'
import { UserDocument } from '../models/user.model'
import UserView from '../views/UserView'

export interface UserDataPayload {
  login: string
  email: string
  role: string
  password: string
}

export interface UserResponse {
  user: UserView
  accessToken: string
  refreshToken: string
}

export interface UserRepository {
  findUser(payload: QueryFilter<UserDocument>): Promise<UserDocument | null>
  createUser(payload: UserDataPayload): Promise<UserDocument>
  getRawUsers(): Promise<UserDocument[]>
  removeUser(_id: string | Types.ObjectId): Promise<void>
}
