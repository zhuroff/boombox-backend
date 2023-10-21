import { Request, Response } from 'express'
import { Types } from 'mongoose'
import { AlbumDocument } from '../types/album.types'
import { CloudEntityDTO } from '../dtos/cloud.dto'
import { AlbumsController } from './albums.controller'
import { Cloud } from '../'
import albumsServices from '../services/albums.services'

export class SyncController {
  static async dbUpdateSplitter(
    cloudFolders: CloudEntityDTO[],
    dbFolders: Array<AlbumDocument & { _id: Types.ObjectId }>
  ) {
    if (!dbFolders.length && cloudFolders.length) {
      return await AlbumsController.create(cloudFolders)
    }

    if (dbFolders.length < cloudFolders.length) {
      const dbFoldersNames = new Set(dbFolders.map(({ folderName }) => folderName))
      const newAlbums = cloudFolders.filter(({ title }) => !dbFoldersNames.has(title))
      return await AlbumsController.create(newAlbums)
    }

    if (dbFolders.length > cloudFolders.length) {
      const cloudFoldersNames = new Set(cloudFolders.map(({ title }) => title))
      const delAlbums = dbFolders.filter(({ folderName }) => !cloudFoldersNames.has(folderName))
      return await AlbumsController.remove(delAlbums.map(({ _id }) => _id))
    }

    return Promise.resolve(true)
  }

  static async sync(_: Request, res: Response) {
    try {
      const cloudFolders = await Cloud.getFolders(
        `${process.env['COLLECTION_ROOT'] || ''}/Collection`,
        { params: { limit: 5000 } }
      ) || []
      const dbFolders = await albumsServices.getAlbumDocs()
      await SyncController.dbUpdateSplitter(cloudFolders, dbFolders)
        && res.status(200).json({ message: 'Successfully synchronized' })
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ errMessage: error.message })
      }
    }
  }
}
