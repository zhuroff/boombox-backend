import { Request, Response } from 'express'
import { Types } from 'mongoose'
import { AlbumDocument } from 'src/types/Album'
import { CloudEntityDTO } from '../dtos/cloud.dto'
import { AlbumsController } from './albums.controller'
import { cloud } from '../'
import albumsServices from '../services/albums.services'

export class SyncController {
  static async dbUpdateSplitter(
    cloudFolders: CloudEntityDTO[],
    dbFolders: Array<AlbumDocument & { _id: Types.ObjectId }>
  ) {
    if (!cloudFolders?.length) {
      throw new Error('Cloud root directory is not exist or empty')
    }

    if (!dbFolders) {
      throw new Error('Database album documents are not exist')
    }

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

  static async sync(req: Request, res: Response) {
    try {
      const cloudFolders = await cloud.getFolders(
        process.env['COLLECTION_ROOT'] || '',
        { params: { limit: 5000 } }
      ) || []
      const dbFolders = await albumsServices.dbAlbumEntries()
      await SyncController.dbUpdateSplitter(cloudFolders, dbFolders)
        && res.status(200).json({ message: 'Successfully synchronized' })
    } catch (error) {
      res.status(500).json(error)
    }
  }
}
