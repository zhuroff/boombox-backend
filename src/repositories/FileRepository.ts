import { FilterQuery, Types, Model } from 'mongoose'
import { FileLinkPayload, FileRepository } from '../types/common.types'

export default class FileRepositoryContract implements FileRepository {
  async updateModelFileLink<T, U extends Model<T>>(
    { fieldname, filename }: FileLinkPayload,
    _id: Types.ObjectId | string,
    Model: U
  ) {
    const $set: Record<string, string> = {
      [fieldname]: `/uploads/${filename}`
    }

    return await Model.findOneAndUpdate(
      { _id } as FilterQuery<T>,
      { $set },
      { new: true }
    )
  }
}