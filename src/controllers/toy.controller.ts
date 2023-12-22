import { Request, Response } from 'express'
import toyServices from '../services/toy.services'

export default {
  async genres(req: Request, res: Response) {
    try {
      const result = await toyServices.genres()
      return res.json(result)
    } catch (error) {
      throw error
    }
  },
  async years(req: Request, res: Response) {
    try {
      const result = await toyServices.years(req.body.path, req.body.dirOnly)
      return res.json(result)
    } catch (error) {
      throw error
    }
  },
  async year(req: Request, res: Response) {
    try {
      const result = await toyServices.year(String(req.params['id']))
      return res.json(result)
    } catch (error) {
      throw error
    }
  }
}
