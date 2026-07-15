import { QueryFilter, Types } from 'mongoose'
import { User, UserDocument } from '../models/user.model'
import { UserDataPayload, UserRepository } from '../types/user'

export default class UserRepositoryContract implements UserRepository {
  async findUser(payload: QueryFilter<UserDocument>) {
    return await User.findOne(payload)
  }

  async createUser({ login, email, role, password }: UserDataPayload) {
    return await User.create({ login, email, role, password })
  }

  async getRawUsers() {
    return await User.find()
  }

  async removeUser(_id: string | Types.ObjectId) {
    await User.deleteOne({ _id })
  }
}
