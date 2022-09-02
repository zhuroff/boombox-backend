import 'module-alias/register'
import { Request, Response } from 'express'
import albumsServices from '~/services/albums.services'

export class AlbumsController {
  static async list(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const result = await albumsServices.list(req)
      return res.json(result)
    } catch (error) {
      next(error)
    }
  }

  static async single(req: Request<{ id: string }>, res: Response, next: (error: unknown) => void) {
    try {
      const result = await albumsServices.single(req.params['id'])
      return res.json(result)
    } catch (error) {
      next(error)
    }
  }

  static async description(req: Request<{ id: string }>, res: Response, next: (error: unknown) => void) {
    try {
      const result = albumsServices.description(req.params['id'], req.body.description)
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }

  static async booklet(req: Request<{ booklet: string }>, res: Response, next: (error: unknown) => void) {
    try {
      const result = await albumsServices.booklet(req.params['booklet'])
      res.json(result)
    } catch (error) {
      next(error)
    }
  }

  static async undisposed(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const result = await albumsServices.undisposed(String(req.body['path']), req.body['id'])
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}
