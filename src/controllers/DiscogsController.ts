import { Request, Response } from 'express'
import DiscogsService from '../services/DiscogsService'

export default class DiscogsController {
  constructor(private discogsService: DiscogsService) {}

  getDiscogsData = async (req: Request, res: Response) => {
    try {
      const result = await this.discogsService.getDiscogsData(req.body)
      res.json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}
