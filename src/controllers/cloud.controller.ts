import { Request, Response } from 'express'
import cloudServices from '../services/cloudServices'

export class CloudController {
  static async getImages(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const result = await cloudServices.getImages(req.body)
      return res.json(result)
    } catch (error) {
      return next(error)
    }
  }
}
