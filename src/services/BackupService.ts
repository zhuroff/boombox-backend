import { Model, PaginateModel } from 'mongoose'
import { rootDir } from '..'
import { Album } from '../models/album.model'
import { Artist } from '../models/artist.model'
import { Collection } from '../models/collection.model'
import { Genre } from '../models/genre.model'
import { Period } from '../models/period.model'
import { Compilation } from '../models/compilation.model'
import { Track } from '../models/track.model'
import { User } from '../models/user.model'
import fs from 'fs'
import path from 'path'

type BackupModelKey = 'users' | 'artists' | 'genres' | 'periods' | 'albums' | 'tracks' | 'collections' | 'compilations'

type BackupModel = PaginateModel<any> | Model<any>

/** Restore order: referenced collections are inserted after their dependencies. */
const BACKUP_MODELS: ReadonlyArray<[BackupModelKey, BackupModel]> = [
  ['users', User],
  ['artists', Artist],
  ['genres', Genre],
  ['periods', Period],
  ['albums', Album],
  ['tracks', Track],
  ['collections', Collection],
  ['compilations', Compilation]
]

export default class BackupService {
  private getBackupDir(folderName?: string) {
    return folderName ? path.join(rootDir, 'backups', folderName) : path.join(rootDir, 'backups')
  }

  private ensureBackupsDir() {
    const backupsDir = this.getBackupDir()

    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true })
    }

    return backupsDir
  }

  private async writeFile(fileName: string, folderName: string, data: unknown[]) {
    await fs.promises.writeFile(
      path.join(this.getBackupDir(folderName), fileName),
      JSON.stringify(data, null, 2),
      'utf8'
    )
  }

  private async readFile(folderName: string, fileName: string) {
    const filePath = path.join(this.getBackupDir(folderName), fileName)
    const data = await fs.promises.readFile(filePath, 'utf8')
    return JSON.parse(data) as unknown[]
  }

  private assertBackupExists(folderName: string) {
    const backupDir = this.getBackupDir(folderName)

    if (!fs.existsSync(backupDir)) {
      throw new Error(`Backup "${folderName}" not found`)
    }
  }

  async save() {
    const timestamp = String(Date.now())
    this.ensureBackupsDir()
    await fs.promises.mkdir(this.getBackupDir(timestamp), { recursive: true })

    await Promise.all(
      BACKUP_MODELS.map(async ([key, model]) => {
        const documents = await model.find({}).lean()
        await this.writeFile(`${key}.json`, timestamp, documents)
      })
    )

    return { message: 'Backup created successfully', timestamp }
  }

  get() {
    this.ensureBackupsDir()
    return fs.readdirSync(this.getBackupDir())
  }

  async recover(date: string) {
    this.assertBackupExists(date)

    const backupData = new Map<BackupModelKey, unknown[]>()

    for (const [key] of BACKUP_MODELS) {
      const fileName = `${key}.json`
      const filePath = path.join(this.getBackupDir(date), fileName)

      if (!fs.existsSync(filePath)) {
        if (key === 'users') {
          continue
        }

        throw new Error(`Backup file "${fileName}" is missing in backup "${date}"`)
      }

      backupData.set(key, await this.readFile(date, fileName))
    }

    for (const [key, model] of BACKUP_MODELS) {
      const documents = backupData.get(key)

      if (!documents) {
        continue
      }

      await model.deleteMany({})
      await model.insertMany(documents)
    }

    return { message: 'Data restore completed successfully' }
  }

  async remove(folderName: string) {
    this.assertBackupExists(folderName)

    await fs.promises.rm(this.getBackupDir(folderName), { recursive: true })
    return { message: 'Backup was successfully deleted' }
  }
}
