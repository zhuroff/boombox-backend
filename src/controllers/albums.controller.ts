import { Request, Response } from 'express'
import { CloudEntityDTO } from '../dtos/cloud.dto'
import albumsServices from '../services/albums.services'

export class AlbumsController {
  static async create(albums: CloudEntityDTO[]) {
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
  }

  static async remove(albums: string[]) {
    try {
      return await Promise.all(albums.map(async (_id) => (
        await albumsServices.removeAlbum(_id)
      )))
    } catch (error) {
      throw error
    }
  }

  static async getAlbumsList(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const result = await albumsServices.getAlbumsList(req)
      return res.json(result)
    } catch (error) {
      return next(error)
    }
  }

  static async getRandomAlbums(req: Request, res: Response, next: (error: unknown) => void) {
    if (Array.isArray(req.query)) {
      throw new Error('Query should be a string in this request')
    }
    try {
      const result = await albumsServices.getRandomAlbums(parseInt(String(req.query?.['quantity'] || 8)))
      return res.json(result)
    } catch (error) {
      return next(error)
    }
  }

  static async getSingleAlbum(req: Request<{ id: string }>, res: Response, next: (error: unknown) => void) {
    try {
      const result = await albumsServices.getSingleAlbum(req.params['id'])
      return res.json(result)
    } catch (error) {
      return next(error)
    }
  }

  static async getAlbumBooklet(req: Request<{ booklet: string }>, res: Response, next: (error: unknown) => void) {
    try {
      const result = await albumsServices.getAlbumBooklet(req.params['booklet'])
      res.json(result)
    } catch (error) {
      return next(error)
    }
  }
}
