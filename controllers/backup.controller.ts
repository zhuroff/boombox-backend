import { Request, Response } from 'express'
import { PaginateModel, Model } from 'mongoose'
import fs from 'fs'
import path from 'path'
import { Album } from  '~/models/album.model'
import { Artist } from '~/models/artist.model'
import { Genre } from '~/models/genre.model'
import { Period } from '~/models/period.model'
import { Frame } from '~/models/frame.model'

type BackupModel = {
  [index: string]: PaginateModel<any> | Model<any, {}, {}>
}

const backupModels: BackupModel = {
  albums: Album,
  artists: Artist,
  genres: Genre,
  periods: Period,
  frames: Frame
}

const createBackupFolder = (folderName: string) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(
      path.join(__dirname, '../backups', folderName),
      (error) => {
        error ? reject(error) : resolve(true)
      }
    )
  })
}

const writeBackupFile = async (fileName: string, folderName: string, data: any) => {
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

const readBackupFile = (folderName: string, fileName: string) => {
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

const backupList = (req: Request, res: Response) => {
  try {
    const folders = fs.readdirSync(path.join(__dirname, '../backups'))
    res.json(folders)
  } catch (error) {
    console.error(error)
    res.status(500).json(error)
  }
}

const backupSave = async (req: Request, res: Response) => {
  const timestamp = String(new Date().getTime())

  try {
    await createBackupFolder(timestamp)

    const backupProcess = Object.keys(backupModels).map(async (el: string) => {
      const Model = backupModels[el]

      if (Model) {
        const response = await Model.find({}).lean()
        return await writeBackupFile(`${el}.json`, timestamp, response)
      }

      const backupSavingError = new Error('Something went wrong')
      throw backupSavingError
    })

    await Promise.all(backupProcess)
    res.json({ message: 'Data backup completed successfully' })
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

const backupRestore = async (req: Request, res: Response) => {
  try {
    const restoreProcess = Object.keys(backupModels).map(async (el: string) => {
      const folderName = req.params['date']
      const Model = backupModels[el]

      if (folderName && Model) {
        const fileContent: any = await readBackupFile(folderName, `${el}.json`)

        await Model.deleteMany({})
        await Model.insertMany(fileContent)

        return el
      }

      const backupRestoreError = new Error('Something went wrong')
      throw backupRestoreError
    })

    await Promise.all(restoreProcess)
    res.json({ message: 'Data restore completed successfully' })
  } catch (error) {
    res.status(500).json(error)
  }
}

const backupDelete = (req: Request, res: Response) => {
  try {
    const folderName = req.params['date']

    if (folderName) {
      fs.rm(
        path.join(__dirname, '../backups', folderName),
        { recursive: true },
        (error) => {
          if (error) throw new Error(error.message || 'Something went wrong')
          res.json({ message: 'Backup was successfully deleted' })
        }
      )
    }

    const backupDeletingError = new Error('Something went wrong')
    throw backupDeletingError
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

const clean = async (req: Request, res: Response) => {
  try {
    const albums = await readBackupFile('1642537794905', `albums.json`) as any[]
    const cleaned = albums.map((el: any) => {
      delete el.period
      return el
    })

    await writeBackupFile('albums.json', '1642537794905', cleaned)

    res.json({ message: 'success' })
  } catch (error) {
    res.status(500).json(error)
  }
}

const controller = {
  backupList,
  backupSave,
  backupRestore,
  backupDelete,
  clean
}

export default controller
