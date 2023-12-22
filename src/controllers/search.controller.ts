import { Request, Response } from 'express'
import searchServices from '../services/search.services'

export default {
  async search(req: Request, res: Response) {
    const { query, key } = req.body

    try {
      const response = await searchServices.search({ query, key })
      res.json(response)
    } catch (error) {
      throw error
    }
  }
}
