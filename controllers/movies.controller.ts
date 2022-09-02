import { Request, Response } from 'express'
import moviesServices from '~/services/movies.services'

export class MoviesController {
  static async list(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const result = await moviesServices.list(req)
      return res.json(result)
    } catch (error) {
      next(error)
    }
  }

  static async item(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const result = await moviesServices.item(String(req.body['path']))
      return res.json(result)
    } catch (error) {
      next(error)
    }
  }
}
