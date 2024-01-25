import { Request, Response } from 'express'
import { Types } from 'mongoose'
import { AlbumDocument } from '../models/album.model'
import { AlbumShape } from '../types/album.types'
import { CloudEntityDTO } from '../dto/cloud.dto'
import albumsServices from '../services/albums.services'
import utils from '../utils'

export default {
  async create(albums: CloudEntityDTO[]) {
    const invalidFolders: Record<string, string>[] = []

    try {
      const albumShapes = await Promise.all(albums.map(async (album) => {
        if (!utils.isAlbumFolderNameValid(album.title)) {
          invalidFolders.push({
            album: album.title,
            cloud: album.cloudURL,
            reason: 'invalid_folder_name'
          })
          return Promise.resolve(null)
        } else {
          return await albumsServices.createShape(album)
        }
      }))

      const validShapes = albumShapes.reduce<AlbumShape[]>((acc, next) => {
        if (next)  {
          if (!next.tracks?.length) {
            invalidFolders.push({
              album: next.title,
              cloud: next.cloudURL,
              reason: 'no_tracks'
            })
          } else if (!next.tracks.every(({ title }) => utils.isTrackFilenameValid(title))) {
            invalidFolders.push({
              album: next.title,
              cloud: next.cloudURL,
              reason: 'invalid_tracks_names'
            })
          } else {
            acc.push(next)
          }
        }

        return acc
      }, [])

      const savedAlbums = await Promise.all(validShapes.map(async (shape) => (
        await albumsServices.createAlbum(shape)
      )))

      return {
        added: savedAlbums.length,
        invalid: invalidFolders.length > 0 ? invalidFolders : 0,
        updated: 0,
        deleted: 0
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  },
  async remove(albums: Types.ObjectId[]) {
    try {
      return await Promise.all(albums.map(async (id) => (
        await albumsServices.removeAlbum(id)
      )))
    } catch (error) {
      throw error
    }
  },
  async update(albums: AlbumDocument[]) {
    try {
      return await albumsServices.updateAlbums(albums)
    } catch (error) {
      throw error
    }
  },
  async getList(req: Request, res: Response) {
    try {
      const result = await albumsServices.getList(req)
      return res.json(result)
    } catch (error) {
      throw error
    }
  },
  async getSingle(req: Request<{ id: string }>, res: Response) {
    try {
      const result = await albumsServices.getSingle(req.params['id'])
      return res.json(result)
    } catch (error) {
      throw error
    }
  },
  async getListRandom(req: Request, res: Response) {
    if (Array.isArray(req.query)) {
      throw new Error('Query should be a string in this request')
    }
    try {
      const result = await albumsServices.getListRandom(parseInt(String(req.query?.['quantity'] || 8)))
      return res.json(result)
    } catch (error) {
      throw error
    }
  }
}
