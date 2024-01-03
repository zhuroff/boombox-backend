import { Request, Response } from 'express'
import embeddedServices from '../services/embedded.services'

export default {
  async create(req: Request, res: Response) {
    try {
      const response = await embeddedServices.create(req.body)
      res.json(response)
    } catch (error) {
      throw error
    }
  },
  async getAllEmbedded(req: Request, res: Response) {
    const { page, limit, sort } = req.body

    try {
      const response = await embeddedServices.getAllEmbedded({ page, limit, sort })
      res.json(response)
    } catch (error) {
      throw error
    }
  },
  async single(req: Request, res: Response) {
    try {
      const response = await embeddedServices.single(String(req.params['id']))
      res.json(response)
    } catch (error) {
      throw error
    }
  },
  async remove(req: Request, res: Response) {
    try {
      const response = await embeddedServices.remove(String(req.params['id']))
      res.json(response)
    } catch (error) {
      throw error
    }
  }
}
