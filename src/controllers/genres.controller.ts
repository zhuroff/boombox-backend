import { Request, Response } from 'express'
import { Genre } from '../models/genre.model'
import { PaginateModel } from 'mongoose'
import { CategoryDocument } from '../types/category.types'
import categoriesServices from '../services/categories.services'
import filesServices from '../services/files.services'

export class GenresController {
  static async getGenresList(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const result = await categoriesServices.getCategoriesList(Genre, req)
      return res.json(result)
    } catch (error) {
      return next(error)
    }
  }

  static async single(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const result = await categoriesServices.single(Genre, req)
      return res.json(result)
    } catch (error) {
      return next(error)
    }
  }

  static async create(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await categoriesServices.create(Genre, req.body.value)
      return res.json(response)
    } catch (error) {
      return next(error)
    }
  }

  static async upload(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await filesServices.upload<CategoryDocument, PaginateModel<CategoryDocument>>(Genre, req)
      return res.json(response)
    } catch (error) {
      return next(error)
    }
  }
}
