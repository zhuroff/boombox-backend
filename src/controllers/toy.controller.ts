import { Request, Response } from 'express'
import toyServices from '../services/toy.services'

export class ToyController {
  static async genres(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const result = await toyServices.genres()
      return res.json(result)
    } catch (error) {
      return next(error)
    }
  }

  static async years(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const result = await toyServices.years(req.body.path, req.body.dirOnly)
      return res.json(result)
    } catch (error) {
      return next(error)
    }
  }

  static async year(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const result = await toyServices.year(String(req.params['id']))
      return res.json(result)
    } catch (error) {
      return next(error)
    }
  }
}
