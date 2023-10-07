import { Request, Response } from 'express'
import embeddedServices from '../services/embedded.services'

export class EmbeddedController {
  static async create(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await embeddedServices.create(req.body)
      res.json(response)
    } catch (error) {
      return next(error)
    }
  }

  static async getAllEmbedded(req: Request, res: Response, next: (error: unknown) => void) {
    const { page, limit, sort } = req.body

    try {
      const response = await embeddedServices.getAllEmbedded({ page, limit, sort })
      res.json(response)
    } catch (error) {
      return next(error)
    }
  }

  static async single(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await embeddedServices.single(String(req.params['id']))
      res.json(response)
    } catch (error) {
      return next(error)
    }
  }

  static async remove(req: Request, res: Response, next: (error: unknown) => void) {
    const { artist, genre, period } = req.body

    try {
      const response = await embeddedServices.remove(String(req.params['id']), { artist, genre, period })
      res.json(response)
    } catch (error) {
      return next(error)
    }
  }
}
