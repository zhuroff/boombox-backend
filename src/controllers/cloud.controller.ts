import { Request, Response } from 'express'
import cloudServices from '../services/cloud.services'

export class CloudController {
  static async getImages(req: Request, res: Response) {
    try {
      const result = await cloudServices.getImages(req.body)
      res.json(result)
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message)
        res.status(404).json({ message: error.message })
      }
    }
  }
}
