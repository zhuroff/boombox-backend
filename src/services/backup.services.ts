import { Document, Model, PaginateModel } from 'mongoose'
import { rootDir } from '..'
import { Album } from '../models/album.model'
import { Artist } from '../models/artist.model'
import { Collection } from '../models/collection.model'
import { Embedded } from '../models/embedded.model'
import { Genre } from '../models/genre.model'
import { Period } from '../models/period.model'
import { Compilation } from '../models/compilation.model'
import { Track } from '../models/track.model'
import { ModelKeys } from '../types/common.types'
import fs from 'fs'
import path from 'path'

const modelsDictMap = new Map<ModelKeys, PaginateModel<any, {}, {}> | Model<any, {}, {}, {}, any>>([
  ['albums', Album],
  ['artists', Artist],
  ['collections', Collection],
  ['embedded', Embedded],
  ['genres', Genre],
  ['periods', Period],
  ['compilations', Compilation],
  ['tracks', Track]
])

export default {
  async save() {
    try {
      const timestamp = String(new Date().getTime())

      await this.createFolder(timestamp)
      const backuping = [...modelsDictMap].map(async ([key, model]) => {
        const response = await model.find({})//.lean()
        return await this.writeFile(`${key}.json`, timestamp, response)
      })

      await Promise.all(backuping)
      return { message: 'Data backup completed successfully' }
    } catch (error) {
      throw error
    }
  },
  get() {
    return fs.readdirSync(path.join(rootDir, '.', 'backups'))
  },
  async recover(date: string) {
    try {
      await Promise.all([...modelsDictMap].map(async ([key, model]) => {
        const folderName = date
        const fileContent = await this.readFile(folderName, `${key}.json`)
        await model.deleteMany({})
        await model.insertMany(fileContent)
        return key
      }))
      return { message: 'Data restore completed successfully' }
    } catch (error) {
      throw error
    }
  },
  async remove(folderName: string) {
    try {
      return new Promise((resolve, reject) => {
        fs.rm(
          path.join(rootDir, './backups', folderName),
          { recursive: true },
          (error) => {
            error ? reject(error) : resolve({ message: 'Backup was successfully deleted' })
          }
        )
      })
    } catch (error) {
      throw error
    }
  },
  async createFolder(folderName: string) {
    try {
      return new Promise((resolve, reject) => {
        fs.mkdir(
          path.join(rootDir, './backups', folderName),
          (error) => {
            error ? reject(error) : resolve(true)
          }
        )
      })
    } catch (error) {
      throw error
    }
  },
  async writeFile(fileName: string, folderName: string, data: Document<any>[]) {
    try {
      return new Promise((resolve, reject) => {
        fs.writeFile(
          path.join(rootDir, './backups', folderName, fileName),
          JSON.stringify(data),
          (error) => {
            error ? reject(error) : resolve(true)
          }
        )
      })
    } catch (error) {
      throw error
    }
  },
  async readFile(folderName: string, fileName: string) {
    try {
      return new Promise((resolve, reject) => {
        fs.readFile(
          path.join(rootDir, './backups', folderName, fileName),
          'utf8',
          (error, data) => (
            error ? reject(error) : resolve(JSON.parse(data))
          )
        )
      })
    } catch (error) {
      throw error
    }
  }
}
