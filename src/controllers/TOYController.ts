import { Request, Response } from 'express'
import TOYService from '../services/TOYService'

export default class TOYController {
  constructor(private toyService: TOYService) {}

  getCloudImages = async (req: Request, res: Response) => {
    try {
      const result = await this.toyService.getCloudImages(req.body)
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

  getCloudImage = async (req: Request, res: Response) => {
    try {
      const result = await this.toyService.getCloudFile(req.body)
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

  getTrackDuration = async (req: Request, res: Response) => {
    try {
      const result = await this.toyService.getTrackDuration(req.body)
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

  getRandomTracks = async (req: Request, res: Response) => {
    try {
      const result = await this.toyService.getRandomTracks(req.body)
      res.json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  getRandomAlbums = async (req: Request, res: Response) => {
    try {
      const result = await this.toyService.getRandomAlbums(req.body)
      res.json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  getFolderContent = async (req: Request, res: Response) => {
    try {
      const result = await this.toyService.getCloudContent(req.body)
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
