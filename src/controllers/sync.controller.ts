import { Request, Response } from 'express'
import { Types } from 'mongoose'
import { Album, AlbumDocument } from '../models/album.model'
import { Track } from '../models/track.model'
import { cloudsMap, getCloudApi } from '..'
import { CloudEntityDTO } from '../types/cloud.types'
import albumController from './albums.controller'
import albumsServices from '../services/albums.services'

export const syncController = {
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
      const cloudFoldersArr = await Promise.all([...cloudsMap].map(async ([_, cloudAPI]) => {
        // return await cloudAPI.getFolders('', { params: { limit: 5000 } })
        return await cloudAPI.getFolders({
          id: '',
          path: ''
        }, { params: { limit: 5000 } })
      }))
      const cloudFolders = cloudFoldersArr.flatMap((el) => el ?? [])
      const dbFolders = await albumsServices.getAlbumDocs()
      const result = await syncController.dbUpdateSplitter(cloudFolders, dbFolders)
      res.status(200).json(result)
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        res.status(500).json({ errMessage: error.message })
      }

      res.status(500).json({ errMessage: 'Internal server error' })
    }
  },
  async fn(cloudFolders: CloudEntityDTO[], dbFolders: AlbumDocument[]) {
    let albumsCount = 0
    let tracksCount = 0
    try {
      if (cloudFolders.length === dbFolders.length) {
        const dbFoldersMap = new Map<any, any>(dbFolders.map((el) => ([
          el.folderName, el
        ])))

        await Promise.all(cloudFolders.map(async (folder) => {
          const cloudId = folder.id
          const cloudURL = folder.cloudURL
          const targetDBEntry = dbFoldersMap.get(folder.title)
          const cloudAPI = getCloudApi(String(cloudURL))
          const tracksConf = cloudURL === 'https://www.googleapis.com'
            ? [cloudId, 'audio']
            : [folder.path]
          // сохранить cloudId на уровне альбома в БД
          await Album.findOneAndUpdate({ _id: targetDBEntry._id }, { $set: { cloudId } }, { new: true })
          albumsCount++

          // @ts-expect-error: fix
          const albumContent = await cloudAPI.getFolderContent(...tracksConf)
          const targetDBEntryTracksMap = new Map<any, any>(targetDBEntry.tracks.map((el: any) => ([
            el.fileName, el
          ])))
          const cloudAlbumTracks = albumContent.items.filter((el) => (
            el.mimeType && el.mimeType !==  'image/webp'
          ))

          try {
            await Promise.all(cloudAlbumTracks.map(async (track) => {
              const cloudTrackId = track.id
              const dbTrackId = targetDBEntryTracksMap.get(track.title)?._id
  
              // сохранить trackId на уровне трека в БД
              if (dbTrackId) {
                await Track.findOneAndUpdate({ _id: dbTrackId }, { $set: { cloudId: cloudTrackId } })
                tracksCount++
              } else {
                console.log(track.title)
                console.log([...targetDBEntryTracksMap].map((el) => el[0]))
              }
              return true
            }))
          } catch (error) {
            console.log(2, error)
            throw error
          }
          return true
        }))
      }
      return {albumsCount, tracksCount}
    } catch (error) {
      console.log(1, error)
      throw error
    }
  },
  async addIds(_: Request, res: Response) {
    try {
      const cloudFoldersArr = await Promise.all([...cloudsMap].map(async ([_, cloudAPI]) => {
        // return await cloudAPI.getFolders('', { params: { limit: 5000 } })
        return await cloudAPI.getFolders({
          id: '',
          path: ''
        }, { params: { limit: 5000 } })
      }))
      const cloudFolders = cloudFoldersArr.flatMap((el) => el ?? [])
      const dbFolders = await albumsServices.getAlbumDocs()
      const result = await syncController.fn(cloudFolders, dbFolders)
      console.log(result)
      res.status(200).json(result)
    } catch (error) {
      console.log(0, error)
      if (error instanceof Error) {
        res.status(500).json({ errMessage: error.message })
      }

      res.status(500).json({ errMessage: 'Internal server error' })
    }
  }
}
