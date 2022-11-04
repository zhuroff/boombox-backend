import { Request, Response } from 'express'
import radioServices from '../services/radio.services'

export class RadioController {
  static async savedStations(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await radioServices.savedStations()
      res.json(response)
    } catch (error) {
      return next(error)
    }
  }

  static async allStations(req: Request, res: Response, next: (error: unknown) => void) {
    const { offset, genre } = req.body

    try {
      const response = await radioServices.allStations({ offset, genre })
      res.json(response)
    } catch (error) {
      return next(error)
    }
  }

  static async saveStation(req: Request, res: Response, next: (error: unknown) => void) {
    const { stationuuid, name } = req.body

    try {
      const response = await radioServices.saveStation({ stationuuid, name })
      res.status(201).json(response)
    } catch (error) {
      return next(error)
    }
  }

  static async deleteStation(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await radioServices.deleteStation(String(req.params['id']))
      res.status(201).json(response)
    } catch (error) {
      return next(error)
    }
  }
}
