import { Request, Response } from 'express'
import discogsServices from '../services/discogs.services'

export default {
  async getList(req: Request, res: Response) {
    const { artist, album, page } = req.body

    try {
      const result = await discogsServices.getList({ artist, album, page })
      res.json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}
