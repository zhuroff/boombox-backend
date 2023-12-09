import { Request, Response } from 'express'
import { CloudEntityDTO } from '../dtos/cloud.dto'
import albumsServices from '../services/albums.services'

export default {
  async create(albums: CloudEntityDTO[]) {
    try {
      const albumShapes = await Promise.all(albums.map(async (album) => (
        await albumsServices.createShape(album)
      )))
      return await Promise.all(albumShapes.map(async (shape) => (
        await albumsServices.createAlbum(shape)
      )))
    } catch (error) {
      throw error
    }
  },

  async remove(albums: string[]) {
    try {
      return await Promise.all(albums.map(async (id) => (
        await albumsServices.removeAlbum(id)
      )))
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
