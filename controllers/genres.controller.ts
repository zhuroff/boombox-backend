import 'module-alias/register'
import { Request, Response } from 'express'
import { Genre } from '~/models/genre.model'
import categoriesServices from '~/services/categories.services'

export class GenresController {
  static async list(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const result = await categoriesServices.list(Genre, req)
      return res.json(result)
    } catch (error) {
      next(error)
    }
  }

  static async single(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const result = await categoriesServices.single(Genre, req)
      return res.json(result)
    } catch (error) {
      next(error)
    }
  }

  static async upload(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await categoriesServices.uploads(Genre, req)
      return res.json(response)
    } catch (error) {
      next(error)
    }
  }
}
