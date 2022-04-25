import 'module-alias/register'
import { Request, Response } from 'express'
import radioServices from '~/services/radio.services'

export class RadioController {
  static async savedStations(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await radioServices.savedStations()
      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async allStations(req: Request, res: Response, next: (error: unknown) => void) {
    const { offset, genre } = req.body

    try {
      const response = await radioServices.allStations({ offset, genre })
      res.json(response)
    } catch (error) {
      next(error)
    }
  }
}
