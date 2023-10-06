import { Request, Response } from 'express'
import tracksServices from '../services/tracks.services'

let lyricsTryings = 0

export class TracksController {
  static async incrementListeningCounter(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      await tracksServices.incrementListening(String(req.params['id']))
      res.json({ message: 'success' })
    } catch (error) {
      return next(error)
    }
  }

  static async saveTrackDuration(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      await tracksServices.duration(String(req.params['id']), req.body.duration)
      res.json({ message: 'success' })
    } catch (error) {
      return next(error)
    }
  }

  static async getLyricsFromDB(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await tracksServices.lyricsDB(String(req.params['id']))
      res.json(response)
    } catch (error) {
      return next(error)
    }
  }

  static async getLyricsExternal(req: Request, res: Response, next: (error: unknown) => void): Promise<void | ReturnType<typeof setTimeout>> {
    try {
      const response = await tracksServices.lyricsExternal(req.body.query)
      res.json(response)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'No result was found' && lyricsTryings < 10) {
          lyricsTryings += 1
          return setTimeout(() => TracksController.getLyricsExternal(req, res, next), 1000)
        } else {
          lyricsTryings = 0
          res.status(500).json({ message: error?.message })
        }
      } else {
        return next(error)
      }
    }
  }

  static async saveLyrics(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      await tracksServices.save(String(req.params['id']), req.body.lyrics)
      res.json({ message: 'Lyrics successfully added to track' })
    } catch (error) {
      return next(error)
    }
  }

  static async getAudio(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await tracksServices.getTrack(req.body['path'])
      res.json(response)
    } catch (error) {
      console.info(error)
      return next(error)
    }
  }
}
