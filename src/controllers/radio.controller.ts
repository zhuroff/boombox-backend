import { Request, Response } from 'express'
import radioServices from '../services/radio.services'

export default {
  async savedStations(req: Request, res: Response) {
    try {
      const response = await radioServices.savedStations()
      res.json(response)
    } catch (error) {
      throw error
    }
  },
  async allStations(req: Request, res: Response) {
    const { offset, genre } = req.body

    try {
      const response = await radioServices.allStations({ offset, genre })
      res.json(response)
    } catch (error) {
      throw error
    }
  },
  async saveStation(req: Request, res: Response) {
    const { stationuuid, name } = req.body

    try {
      const response = await radioServices.saveStation({ stationuuid, name })
      res.status(201).json(response)
    } catch (error) {
      throw error
    }
  },
  async deleteStation(req: Request, res: Response) {
    try {
      const response = await radioServices.deleteStation(String(req.params['id']))
      res.status(201).json(response)
    } catch (error) {
      throw error
    }
  }
}
