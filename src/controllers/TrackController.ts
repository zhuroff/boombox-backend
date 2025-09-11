import { Request, Response } from 'express'
import TrackService from '../services/TrackService'

export default class TrackController {
  constructor(private trackService: TrackService) {}

  saveTrackDuration = async (req: Request, res: Response) => {
    try {
      await this.trackService.saveTrackDuration(String(req.params['id']), req.body.duration)
      res.json({ message: 'success' })
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  getTrackLyrics = async (req: Request, res: Response) => {
    try {
      const response = await this.trackService.getTrackLyrics(String(req.params['id']))
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  updateTrack = async (req: Request, res: Response) => {
    try {
      await this.trackService.updateTrack(req.body)
      res.json({ message: 'success' })
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  getWave = async (req: Request, res: Response) => {
    try {
      const response = await this.trackService.getWave(req)
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  getTrackExternalLyrics = async (req: Request, res: Response) => {
    try {
      const response = await this.trackService.getTrackExternalLyrics(req)
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  getTrackAudio = async (req: Request, res: Response) => {
    try {
      if (!req.query['cloudURL'] || !req.params['path']) {
        throw new Error('Cloud URL and path are required')
      }

      const response = await this.trackService.getTrackAudio(req.params['path'], String(req.query['cloudURL']))
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }
}
