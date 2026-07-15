import { QueryFilter, Types, Model } from 'mongoose'
import { FileLinkPayload, FileRepository } from '../types/file'

export default class FileRepositoryContract implements FileRepository {
  async updateModelFileLink<T>(
    { fieldname, filename }: FileLinkPayload,
    _id: Types.ObjectId | string,
    Model: Model<T>
  ) {
    const $set: Record<string, string> = {
      [fieldname]: `/uploads/${filename}`
    }

    return await Model.findOneAndUpdate({ _id } as QueryFilter<T>, { $set }, { new: true })
  }
}
