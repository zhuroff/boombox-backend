import { Album } from '../models/album.model'
import { Artist } from '../models/artist.model'
import { Collection } from '../models/collection.model'
import { Embedded } from '../models/embedded.model'
import { Genre } from '../models/genre.model'
import { Period } from '../models/period.model'
import { Playlist } from '../models/playlist.model'
import { Radio } from '../models/radio.model'
import { Track } from '../models/track.model'
import { BackupModel } from '../types/Backups'
import { ModelResponse } from '../types/ReqRes'
import fs from 'fs'
import path from 'path'

class BackupServices {
  #backupModels: BackupModel = {
    albums: Album,
    artists: Artist,
    collections: Collection,
    embedded: Embedded,
    genres: Genre,
    periods: Period,
    playlists: Playlist,
    radio: Radio,
    tracks: Track
  }

  async saveBackup() {
    const timestamp = String(new Date().getTime())

    await this.createBackupFolder(timestamp)

    const backupProcess = Object.keys(this.#backupModels).map(async (key: string) => {
      const Model = this.#backupModels[key]

      if (Model) {
        const response: ModelResponse = await Model.find({}).lean()
        return await this.writeBackupFile(`${key}.json`, timestamp, response)
      }

      const backupSavingError = new Error('Something went wrong')
      throw backupSavingError
    })

    await Promise.all(backupProcess)
    return { message: 'Data backup completed successfully' }
  }

  getBackup() {
    return fs.readdirSync(path.join(__dirname, '../..', 'backups'))
  }

  async restoreBackup(date: string) {
    const restoreProcess = Object.keys(this.#backupModels).map(async (el: string) => {
      const folderName = date
      const Model = this.#backupModels[el]

      if (folderName && Model) {
        const fileContent: any = await this.readBackupFile(folderName, `${el}.json`)

        await Model.deleteMany({})
        await Model.insertMany(fileContent)

        return el
      } else {
        throw new Error('Something went wrong')
      }
    })

    await Promise.all(restoreProcess)
    return { message: 'Data restore completed successfully' }
  }

  async removeBackup(folderName: string) {
    return new Promise((resolve, reject) => {
      fs.rm(
        path.join(__dirname, '../backups', folderName),
        { recursive: true },
        (error) => {
          error ? reject(error) : resolve({ message: 'Backup was successfully deleted' })
        }
      )
    })
  }

  async createBackupFolder(folderName: string) {
    return new Promise((resolve, reject) => {
      fs.mkdir(
        path.join(__dirname, '../backups', folderName),
        (error) => {
          error ? reject(error) : resolve(true)
        }
      )
    })
  }

  async writeBackupFile(fileName: string, folderName: string, data: ModelResponse) {
    return new Promise((resolve, reject) => {
      fs.writeFile(
        path.join(__dirname, '../backups', folderName, fileName),
        JSON.stringify(data),
        (error) => {
          error ? reject(error) : resolve(true)
        }
      )
    })
  }

  async readBackupFile(folderName: string, fileName: string) {
    return new Promise((resolve, reject) => {
      fs.readFile(
        path.join(__dirname, '../backups', folderName, fileName),
        'utf8',
        (error, data) => (
          error ? reject(error) : resolve(JSON.parse(data))
        )
      )
    })
  }
}

export default new BackupServices()
