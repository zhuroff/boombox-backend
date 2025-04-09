import { Request, Response } from 'express'
import TrackService from '../services/TrackService'

export default class TrackController {
  constructor(private trackService: TrackService) {}

  incrementListeningCounter = async (req: Request, res: Response) => {
    try {
      await this.trackService.incrementListeningCounter(String(req.params['id']))
      res.json({ message: 'success' })
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

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
      const response = await this.trackService.getTrackExternalLyrics(req.body.query)
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  saveTrackLyrics = async (req: Request, res: Response) => {
    try {
      await this.trackService.saveTrackLyrics(String(req.params['id']), req.body.lyrics)
      res.json({ message: 'Lyrics successfully added to track' })
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  getAudio = async (req: Request, res: Response) => {
    try {
      const response = await this.trackService.getAudio({
        id: req.body['path'] || req.body['cloudId'],
        path: '',
        cloudURL: req.body['cloudURL']
      })
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }
}
