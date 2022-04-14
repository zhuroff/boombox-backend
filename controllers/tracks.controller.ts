import 'module-alias/register'
import { Request, Response } from 'express'
import { Track } from '~/models/track.model'
import Genius from 'genius-lyrics'

const GClient = new Genius.Client(process.env['GENIUS_SECRET'])

let lyricsTryings = 0

const incrementListeningCounter = async (req: Request, res: Response) => {
  try {
    await Track.findByIdAndUpdate(req.params['id'], { $inc: { listened: 1 } })
    res.json({ message: 'success' })
  } catch (error) {
    res.status(500).json(error)
  }
}

const saveTrackDuration = async (req: Request, res: Response) => {
  try {
    await Track.findByIdAndUpdate(req.params['id'], { $set: { duration: req.body.duration } })
    res.json({ message: 'success' })
  } catch (error) {
    res.status(500).json(error)
  }
}

const getLyricsFromDB = async (req: Request, res: Response) => {
  try {
    const response = await Track.findById(req.params['id'])
    res.json({ lyrics: response?.lyrics })
  } catch (error) {
    res.status(500).json(error)
  }
}

const getLyricsExternal = async (req: Request, res: Response): Promise<void | ReturnType<typeof setTimeout>> => {
  try {
    const searches = await GClient.songs.search(req.body.query)
    const resultArray = searches.map(async (el) => {
      const item = {
        title: el.title,
        thumbnail: el.thumbnail,
        artist: el.artist.name,
        lyrics: await el.lyrics()
      }

      return item
    })

    const result = await Promise.all(resultArray)

    res.json(result)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'No result was found' && lyricsTryings < 10) {
        lyricsTryings += 1
        return setTimeout(() => getLyricsExternal(req, res), 1000)
      }
      
      res.status(500).json({ error: error?.message })
      lyricsTryings = 0
    } else {
      res.status(500).json(error)
    }
  }
}

const saveLyrics = async (req: Request, res: Response) => {
  try {
    await Track.findByIdAndUpdate(req.params['id'], { $set: { lyrics: req.body.lyrics } })
    res.json({ message: 'Lyrics successfully added to track' })
  } catch (error) {
    res.status(500).json(error)
  }
}

const controller = {
  incrementListeningCounter,
  saveTrackDuration,
  getLyricsFromDB,
  getLyricsExternal,
  saveLyrics
}

export default controller
