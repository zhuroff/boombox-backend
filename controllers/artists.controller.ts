import 'module-alias/register'
import { Request, Response } from 'express'
import { Artist } from '~/models/artist.model'
import { PaginateModel } from 'mongoose'
import { CategoryModel } from '~/types/Category'
import categoriesServices from '~/services/categories.services'
import uploadsServices from '~/services/uploads.services'

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

  static async create(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await categoriesServices.create(Artist, req.body.value)
      return res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async upload(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await uploadsServices.upload<PaginateModel<CategoryModel>>(Artist, req)
      return res.json(response)
    } catch (error) {
      next(error)
    }
  }
}
