import { Request, Response } from 'express'
import { Artist } from '../models/artist.model'
import { PaginateModel } from 'mongoose'
import { CategoryDocument } from '../types/Category'
import categoriesServices from '../services/categories.services'
import filesServices from '../services/files.services'

export class ArtistsController {
  static async list(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const result = await categoriesServices.list(Artist, req)
      return res.json(result)
    } catch (error) {
      return next(error)
    }
  }

  static async single(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const result = await categoriesServices.single(Artist, req)
      return res.json(result)
    } catch (error) {
      return next(error)
    }
  }

  static async create(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await categoriesServices.create(Artist, req.body.value)
      return res.json(response)
    } catch (error) {
      return next(error)
    }
  }

  static async upload(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await filesServices.upload<PaginateModel<CategoryDocument>>(Artist, req)
      return res.json(response)
    } catch (error) {
      return next(error)
    }
  }

  static async remove(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await categoriesServices.remove(Artist, String(req.params['id']))
      return res.json(response)
    } catch (error) {
      return next(error)
    }
  }
}
