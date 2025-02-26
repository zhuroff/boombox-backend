import { Request, Response } from 'express'
import cloudService from '../services/cloud.service'

export default {
  async getImages(req: Request, res: Response) {
    try {
      const result = await cloudService.getImages(req.body)
      res.json(result)
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        res.status(404).json({ message: error.message })
      } else {
        res.status(500).json({ message: 'Internal server error' })
      }
    }
  },
  async getImage(req: Request, res: Response) {
    try {
      const result = await cloudService.getFile(req.body)
      res.json(result)
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        res.status(404).json({ message: error.message })
      } else {
        res.status(500).json({ message: 'Internal server error' })
      }
    }
  },
  async getTrackDuration(req: Request, res: Response) {
    try {
      const result = await cloudService.getTrackDuration(req['body'])
      res.json(result)
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        res.status(404).json({ message: error.message })
      } else {
        res.status(500).json({ message: 'Internal server error' })
      }
    }
  },
  async getRandomTracks(req: Request, res: Response) {
    try {
      const result = await cloudService.getRandomTracks(req['body'])
      res.json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  async getRandomAlbums(req: Request, res: Response) {
    try {
      const result = await cloudService.getRandomAlbums(req['body'])
      res.json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  async getFolderContent(req: Request, res: Response) {
    try {
      const result = await cloudService.getFolderContent(req['body'])
      res.json(result)
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        res.status(404).json({ message: error.message })
      } else {
        res.status(500).json({ message: 'Internal server error' })
      }
    }
  }
}
