import 'module-alias/register'
import { Request, Response } from 'express'
import { Artist } from '~/models/artist.model'
import categoriesServices from '~/services/categories.services'

export class ArtistsController {
  static async list(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const result = await categoriesServices.list(Artist, req)
      return res.json(result)
    } catch (error) {
      next(error)
    }
  }

  static async single(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const result = await categoriesServices.single(Artist, req)
      return res.json(result)
    } catch (error) {
      next(error)
    }
  }

  static async upload(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await categoriesServices.uploads(Artist, req)
      return res.json(response)
    } catch (error) {
      next(error)
    }
  }
}
