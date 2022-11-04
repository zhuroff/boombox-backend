import { Request, Response } from 'express'
import searchServices from '../services/search.services'

export class SearchController {
  static async search(req: Request, res: Response, next: (error: unknown) => void) {
    const { query, key } = req.body

    try {
      const response = await searchServices.search({ query, key })
      res.json(response)
    } catch (error) {
      return next(error)
    }
  }
}
