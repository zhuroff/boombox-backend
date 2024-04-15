import { Request } from 'express'
import { FilterQuery, Model } from 'mongoose'
import fs from 'fs'
import path from 'path'

export default {
  async upload<T, U extends Model<T>>(Model: U, req: Request) {
    if (!req.params['id']) {
      throw new Error('ID not found in request params')
    }

    if (req.file) {
      const $set: Record<string, string> = {
        [req.file.fieldname]: `/uploads/${req.file.filename}`
      }

      return await Model.findOneAndUpdate({
        _id: req.params['id']
      } as FilterQuery<T>, { $set }, { new: true })
    }
    throw new Error('File not found')
  },

  remove(files: string[]) {
    files.map((link) => (
      fs.unlinkSync(path.join(__dirname, '../', encodeURI(link)))
    ))
  }
}
