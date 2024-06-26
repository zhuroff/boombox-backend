import { Request, Response } from 'express'
import cloudServices from '../services/cloud.services'

export default {
  async getImages(req: Request, res: Response) {
    try {
      const result = await cloudServices.getImages(req.body)
      res.json(result)
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ message: error.message })
      } else {
        res.status(500).json({ message: 'Internal server error' })
      }
    }
  },
  async getImage(req: Request, res: Response) {
    try {
      const result = await cloudServices.getFile(req.body)
      res.json(result)
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ message: error.message })
      } else {
        res.status(500).json({ message: 'Internal server error' })
      }
    }
  },
  async getTrackDuration(req: Request, res: Response) {
    try {
      const result = await cloudServices.getTrackDuration(req['body'])
      res.json(result)
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ message: error.message })
      } else {
        res.status(500).json({ message: 'Internal server error' })
      }
    }
  },
  async getRandomTracks(req: Request, res: Response) {
    try {
      const result = await cloudServices.getRandomTracks(req['body'])
      res.json(result)
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  async getRandomAlbums(req: Request, res: Response) {
    try {
      const result = await cloudServices.getRandomAlbums(req['body'])
      res.json(result)
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  async getFolderContent(req: Request, res: Response) {
    try {
      const result = await cloudServices.getFolderContent(req['body'])
      res.json(result)
    } catch (error) {
      if (error instanceof Error) {
        res.status(404).json({ message: error.message })
      } else {
        res.status(500).json({ message: 'Internal server error' })
      }
    }
  }
}
