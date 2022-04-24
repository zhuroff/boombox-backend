import 'module-alias/register'
import { Request, Response } from 'express'
import { Period } from '~/models/period.model'
import { PaginateModel } from 'mongoose'
import { CategoryModel } from '~/types/Category'
import categoriesServices from '~/services/categories.services'
import filesServices from '~/services/files.services'

export class PeriodsController {
  static async list(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const result = await categoriesServices.list(Period, req)
      return res.json(result)
    } catch (error) {
      next(error)
    }
  }

  static async single(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const result = await categoriesServices.single(Period, req)
      return res.json(result)
    } catch (error) {
      next(error)
    }
  }

  static async create(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await categoriesServices.create(Period, req.body.value)
      return res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async upload(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await filesServices.upload<PaginateModel<CategoryModel>>(Period, req)
      return res.json(response)
    } catch (error) {
      next(error)
    }
  }
}
