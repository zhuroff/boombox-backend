import { Request, Response } from 'express'
import framesServices from '../services/frames.services'

export class FramesController {
  static async create(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await framesServices.create(req.body)
      res.json(response)
    } catch (error) {
      return next(error)
    }
  }

  static async list(req: Request, res: Response, next: (error: unknown) => void) {
    const { page, limit, sort } = req.body

    try {
      const response = await framesServices.list({ page, limit, sort })
      res.json(response)
    } catch (error) {
      return next(error)
    }
  }

  static async single(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await framesServices.single(String(req.params['id']))
      res.json(response)
    } catch (error) {
      return next(error)
    }
  }

  static async remove(req: Request, res: Response, next: (error: unknown) => void) {
    const { artist, genre, period } = req.body

    try {
      const response = await framesServices.remove(String(req.params['id']), { artist, genre, period })
      res.json(response)
    } catch (error) {
      return next(error)
    }
  }
}
