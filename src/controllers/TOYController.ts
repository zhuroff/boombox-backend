import { Request, Response } from 'express'
import TOYService from '../services/TOYService'

export default class TOYController {
  constructor(private toyService: TOYService) {}

  getTOYList = async (req: Request, res: Response) => {
    try {
      if (req.params['genre'] && req.params['genre'] === 'random') {
        await this.getTOYAlbum(req, res)
      } else {
        const result = await this.toyService.getTOYList(req)
        res.json(result)
      }
    } catch (error) {
      res.status(500).json(error)
    }
  }

  getTOYAlbum = async (req: Request, res: Response) => {
    try {
      const result = await this.toyService.getTOYAlbum(req)
      res.json(result)
    } catch (error) {
      res.status(500).json(error)
    }
  }

  getTOYContent = async (req: Request, res: Response) => {
    try {
      const result = await this.toyService.getTOYContent(req)
      res.json(result)
    } catch (error) {
      res.status(500).json(error)
    }
  }

  getTOYWave = async (req: Request, res: Response) => {
    try {
      const result = await this.toyService.getTOYWave(req)
      res.json(result)
    } catch (error) {
      res.status(500).json(error)
    }
  }
}
