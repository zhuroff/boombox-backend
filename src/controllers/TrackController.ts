import { Request, Response } from 'express'
import TrackService from '../services/TrackService'

export default class TrackController {
  constructor(private trackService: TrackService) {}

  async incrementListeningCounter(req: Request, res: Response) {
    try {
      await this.trackService.incrementListeningCounter(String(req.params['id']))
      res.json({ message: 'success' })
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  async saveTrackDuration(req: Request, res: Response) {
    try {
      await this.trackService.saveTrackDuration(String(req.params['id']), req.body.duration)
      res.json({ message: 'success' })
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  async getTrackLyrics(req: Request, res: Response) {
    try {
      const response = await this.trackService.getTrackLyrics(String(req.params['id']))
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  async getWave(req: Request, res: Response) {
    try {
      const response = await this.trackService.getWave(req)
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  async getTrackExternalLyrics(req: Request, res: Response): Promise<void | ReturnType<typeof setTimeout>> {
    try {
      const response = await this.trackService.getTrackExternalLyrics(req.body.query)
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  async saveTrackLyrics(req: Request, res: Response) {
    try {
      await this.trackService.saveTrackLyrics(String(req.params['id']), req.body.lyrics)
      res.json({ message: 'Lyrics successfully added to track' })
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  async getAudio(req: Request, res: Response) {
    try {
      const response = await this.trackService.getAudio({
        id: req.body['path'] || req.body['cloudId'],
        path: '',
        cloudURL: req.body['cloudURL'],
        cluster: req.body['root']
      })
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }
}
