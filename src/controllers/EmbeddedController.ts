import { Request, Response } from 'express'
import EmbeddedService from '../services/EmbeddedService'

export default class EmbeddedController {
  constructor(private embeddedService: EmbeddedService) {}

  createEmbedded = async (req: Request, res: Response) => {
    try {
      const response = await this.embeddedService.createEmbedded(req.body)
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  getPopulatedEmbeddedList = async (req: Request, res: Response) => {
    try {
      const response = await this.embeddedService.getPopulatedEmbeddedList(req)
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  getPopulatedEmbedded = async (req: Request, res: Response) => {
    try {
      const response = await this.embeddedService.getPopulatedEmbedded(String(req.params['id']))
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  removeEmbedded = async (req: Request, res: Response) => {
    try {
      const response = await this.embeddedService.removeEmbedded(String(req.params['id']))
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }
}