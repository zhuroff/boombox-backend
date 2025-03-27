import { Request, Response } from 'express'
import SearchService from '../services/SearchService'

export default class SearchController {
  constructor(private readonly searchService: SearchService) {}

  search = async (req: Request, res: Response) => {
    const { query, key } = req.body

    try {
      const response = await this.searchService.search({ query, key })
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }
}
