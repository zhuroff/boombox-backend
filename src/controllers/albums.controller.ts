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

  static async list(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const result = await albumsServices.list(req)
      return res.json(result)
    } catch (error) {
      return next(error)
    }
  }

  static async random(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const result = await albumsServices.random(parseInt(req.params?.['quantity'] || '8'))
      return res.json(result)
    } catch (error) {
      return next(error)
    }
  }

  static async single(req: Request<{ id: string }>, res: Response, next: (error: unknown) => void) {
    try {
      const result = await albumsServices.single(req.params['id'])
      return res.json(result)
    } catch (error) {
      return next(error)
    }
  }

  static async description(req: Request<{ id: string }>, res: Response, next: (error: unknown) => void) {
    try {
      const result = albumsServices.description(req.params['id'], req.body.description)
      res.status(201).json(result)
    } catch (error) {
      return next(error)
    }
  }

  static async booklet(req: Request<{ booklet: string }>, res: Response, next: (error: unknown) => void) {
    try {
      const result = await albumsServices.booklet(req.params['booklet'])
      res.json(result)
    } catch (error) {
      return next(error)
    }
  }
}
