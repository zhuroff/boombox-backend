import { Request, Response } from 'express'
import { Types } from 'mongoose'
import { AlbumDocument } from '../models/album.model'
import { cloudsMap } from '..'
import { CloudEntityDTO } from '../types/cloud.types'
import albumController from './albums.controller'
import albumsServices from '../services/albums.services'

export const controller = {
  async dbUpdateSplitter(cloudFolders: CloudEntityDTO[], dbFolders: AlbumDocument[]) {
    if (!dbFolders.length && !cloudFolders.length) {
      return Promise.resolve({ added: 0, updated: 0, deleted: 0, invalid: 0 })
    }

    try {
      if (!cloudFolders.length && dbFolders.length) {
        const deleted = await albumController.remove(dbFolders.map(({ _id }) => _id))
        return { added: 0, updated: 0, deleted: deleted.length, invalid: 0 }
      }
  
      if (!dbFolders.length && cloudFolders.length) {
        return await albumController.create(cloudFolders)
      }
  
      const dbFoldersMap = new Map(dbFolders.map((folder) => [folder.folderName, folder]))
      const albumsToAdd: CloudEntityDTO[] = []
      const albumsToFix: AlbumDocument[] = []
  
      cloudFolders.forEach((folder) => {
        const dbFolder = dbFoldersMap.get(folder.title)
        
        if (dbFolder) {
          if (dbFolder.cloudURL !== folder.cloudURL) {
            dbFolder.cloudURL = folder.cloudURL
            albumsToFix.push(dbFolder)
          }
          dbFoldersMap.delete(folder.title)
        } else {
          albumsToAdd.push(folder)
        }
      })
  
      const addedAlbums = albumsToAdd.length
        ? await albumController.create(albumsToAdd)
        : { added: 0, invalid: 0 }
  
      const fixedAlbums = albumsToFix.length
        ? await albumController.update(albumsToFix)
        : []
  
      const deletedAlbums = dbFoldersMap.size
        ? await albumController.remove(
            [...dbFoldersMap].reduce<Types.ObjectId[]>((acc, [_, next]) => {
              next && acc.push(next._id)
              return acc
            }, [])
          )
        : []
  
      return {
        ...addedAlbums,
        updated: fixedAlbums.length,
        deleted: deletedAlbums.length
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  },
  async sync(_: Request, res: Response) {
    try {
      const cloudFoldersArr = await Promise.all([...cloudsMap].map(async ([_, cloudAPI]) => (
        await cloudAPI.getFolders(
          { id: '', path: '' },
          { params: { limit: 5000 } }
        )
      )))
      const cloudFolders = cloudFoldersArr.flatMap((el) => el ?? [])
      const dbFolders = await albumsServices.getAlbumDocs()
      const result = await controller.dbUpdateSplitter(cloudFolders, dbFolders)
      res.status(200).json(result)
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        res.status(500).json({ errMessage: error.message })
      }

      res.status(500).json({ errMessage: 'Internal server error' })
    }
  }
}
