import { Request } from 'express'
import { Model } from 'mongoose'
import fs from 'fs'
import path from 'path'

class FilesServices {
  async upload<T extends Model<any>>(Model: T, req: Request) {
    if (req.file) {
      const $set: Record<string, string> = {
        [req.file.fieldname]: `/uploads/${req.file.filename}`
      }

      return await Model.findOneAndUpdate({
        _id: req.params['id']
      }, { $set }, { new: true })
    }
    throw new Error('File not found')
  }

  remove(files: string[]) {
    files.map((link) => (
      fs.unlinkSync(path.join(__dirname, '../', encodeURI(link)))
    ))
  }
}

export default new FilesServices()
