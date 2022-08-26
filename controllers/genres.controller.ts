import 'module-alias/register'
import { Request, Response } from 'express'
import { Genre } from '~/models/genre.model'
import { PaginateModel } from 'mongoose'
import { CategoryDocument } from '~/types/Category'
import categoriesServices from '~/services/categories.services'
import filesServices from '~/services/files.services'

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

  static async create(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await categoriesServices.create(Genre, req.body.value)
      return res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async upload(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await filesServices.upload<PaginateModel<CategoryDocument>>(Genre, req)
      return res.json(response)
    } catch (error) {
      next(error)
    }
  }
}
