import { Request, Response } from 'express'
import tracksServices from '../services/tracks.services'

export default {
  async incrementListeningCounter(req: Request, res: Response) {
    try {
      await tracksServices.incrementListeningCounter(String(req.params['id']))
      res.json({ message: 'success' })
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  },
  async saveTrackDuration(req: Request, res: Response) {
    try {
      await tracksServices.saveTrackDuration(String(req.params['id']), req.body.duration)
      res.json({ message: 'success' })
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  },
  async getLyrics(req: Request, res: Response) {
    try {
      const response = await tracksServices.getLyrics(String(req.params['id']))
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  },
  async getWave(req: Request, res: Response) {
    try {
      const response = await tracksServices.getWave(req)
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  },
  async getLyricsExternal(req: Request, res: Response): Promise<void | ReturnType<typeof setTimeout>> {
    try {
      const response = await tracksServices.getLyricsExternal(req.body.query)
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  },
  async saveLyrics(req: Request, res: Response) {
    try {
      await tracksServices.saveLyrics(String(req.params['id']), req.body.lyrics)
      res.json({ message: 'Lyrics successfully added to track' })
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  },
  async getAudio(req: Request, res: Response) {
    try {
      const response = await tracksServices.getAudio(req.body['path'], req.body['cloudURL'], req.body['root'])
      res.json(response)
    } catch (error) {
      console.info(error)
      console.error(error)
      res.status(500).json(error)
    }
  }
}