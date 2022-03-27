import 'module-alias/register'
import { Request, Response } from 'express'
import { Period } from '~/models/period.model'
import categoriesServices from '~/services/categories.services'

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

  static async upload(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await categoriesServices.uploads(Period, req)
      return res.json(response)
    } catch (error) {
      next(error)
    }
  }
}
