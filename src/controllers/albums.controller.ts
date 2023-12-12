import { Request, Response } from 'express'
import { Types } from 'mongoose'
import { CloudEntityDTO } from '../dtos/cloud.dto'
import { AlbumShape, AlbumDocument } from '../types/album.types'
import albumsServices from '../services/albums.services'
import utils from '../utils'

export default {
  async create(albums: CloudEntityDTO[]) {
    const invalidFolders: Record<string, string>[] = []

    try {
      const albumShapes = await Promise.all(albums.map(async (album) => {
        if (!utils.isAlbumFolderNameValid(album.title)) {
          invalidFolders.push({ album: album.title, cloud: album.cloudURL })
          return Promise.resolve(null)
        } else {
          return await albumsServices.createShape(album)
        }
      }))

      const validShapes = albumShapes.filter((el): el is AlbumShape => el !== null)

      const savedAlbums = await Promise.all(validShapes.map(async (shape) => (
        await albumsServices.createAlbum(shape)
      )))

      return {
        added: savedAlbums.length,
        invalid: invalidFolders,
        updated: 0,
        deleted: 0
      }
    } catch (error) {
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
