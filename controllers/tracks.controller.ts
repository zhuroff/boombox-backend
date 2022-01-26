import 'module-alias/register'
import { Request, Response } from 'express'
import { Track } from '~/models/track.model'

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

const controller = {
  incrementListeningCounter,
  saveTrackDuration
}

export default controller
