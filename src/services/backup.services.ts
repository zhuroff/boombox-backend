import { LeanDocument, Model, PaginateModel } from 'mongoose'
import { rootDir } from '..'
import { Album } from '../models/album.model'
import { Artist } from '../models/artist.model'
import { Collection } from '../models/collection.model'
import { Embedded } from '../models/embedded.model'
import { Genre } from '../models/genre.model'
import { Period } from '../models/period.model'
import { Playlist } from '../models/playlist.model'
import { Radio } from '../models/radio.model'
import { Track } from '../models/track.model'
import { TOYPage } from '../models/toy.model'
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
  ['playlists', Playlist],
  ['radio', Radio],
  ['tracks', Track],
  ['radio', Radio],
  ['toys', TOYPage]
])

export default {
  async save() {
    const timestamp = String(new Date().getTime())

    await this.createFolder(timestamp)
    const backuping = [...modelsDictMap].map(async ([key, model]) => {
      const response = await model.find({}).lean()
      return await this.writeFile(`${key}.json`, timestamp, response)
    })

    await Promise.all(backuping)
    return { message: 'Data backup completed successfully' }
  },

  get() {
    return fs.readdirSync(path.join(rootDir, '.', 'backups'))
  },

  async recover(date: string) {
    await Promise.all([...modelsDictMap].map(async ([key, model]) => {
      const folderName = date
      const fileContent = await this.readFile(folderName, `${key}.json`)
      await model.deleteMany({})
      await model.insertMany(fileContent)
      return key
    }))
    return { message: 'Data restore completed successfully' }
  },

  async remove(folderName: string) {
    return new Promise((resolve, reject) => {
      fs.rm(
        path.join(rootDir, './backups', folderName),
        { recursive: true },
        (error) => {
          error ? reject(error) : resolve({ message: 'Backup was successfully deleted' })
        }
      )
    })
  },

  async createFolder(folderName: string) {
    return new Promise((resolve, reject) => {
      fs.mkdir(
        path.join(rootDir, './backups', folderName),
        (error) => {
          error ? reject(error) : resolve(true)
        }
      )
    })
  },

  async writeFile(fileName: string, folderName: string, data: LeanDocument<any>[]) {
    return new Promise((resolve, reject) => {
      fs.writeFile(
        path.join(rootDir, './backups', folderName, fileName),
        JSON.stringify(data),
        (error) => {
          error ? reject(error) : resolve(true)
        }
      )
    })
  },

  async readFile(folderName: string, fileName: string) {
    return new Promise((resolve, reject) => {
      fs.readFile(
        path.join(rootDir, './backups', folderName, fileName),
        'utf8',
        (error, data) => (
          error ? reject(error) : resolve(JSON.parse(data))
        )
      )
    })
  }
}
