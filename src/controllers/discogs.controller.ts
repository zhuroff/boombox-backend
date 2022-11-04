import { Request, Response } from 'express'
import discogsServices from '../services/discogs.services'

export class DiscogsController {
  static async list(req: Request, res: Response, next: (error: unknown) => void) {
    const { artist, album, page } = req.body

    try {
      const result = await discogsServices.list({ artist, album, page })
      res.json(result)
    } catch (error) {
      return next(error)
    }
  }

  static async single(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const result = await discogsServices.single(Number(req.params['id']))
      res.json(result)
    } catch (error) {
      return next(error)
    }
  }
}
