import { Request, Response } from 'express'
import newsServices from '~/services/news.services'

export class NewsController {
  static async list(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const result = await newsServices.list(req.body.page, req.body.limit)
      return res.json(result)
    } catch (error) {
      next(error)
    }
  }
}
