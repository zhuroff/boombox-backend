import { Request } from 'express'
import { Model } from 'mongoose'
import { FileRepository } from '../types/file'
import { rootDir } from '../index'
import fs from 'fs'
import path from 'path'

export default class FileService {
  constructor(private fileRepository: FileRepository) {}

  async updateModelFileLink<T>(Model: Model<T>, req: Request) {
    if (!req.params['id']) {
      throw new Error('ID not found in request params')
    }

    if (!req.file) {
      throw new Error('File not found')
    }

    return await this.fileRepository.updateModelFileLink<T>(
      { fieldname: req.file.fieldname, filename: req.file.filename },
      req.params['id'],
      Model
    )
  }

  remove(files: string[]) {
    files.map((link) => fs.unlinkSync(path.join(rootDir, encodeURI(link))))
  }
}
