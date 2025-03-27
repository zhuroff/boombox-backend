import { Request, Response } from 'express'
import SyncService from '../services/SyncService'

export default class SyncController {
  constructor(private readonly syncService: SyncService) {}

  async sync(_: Request, res: Response) {   
    try {
      const result = await this.syncService.synchronize()
      res.status(200).json(result)
    } catch (error) {
      console.error(error)

      if (error instanceof Error) {
        res.status(500).json({ errMessage: error.message })
      }

      res.status(500).json({ errMessage: 'Internal server error' })
    }
  }
}
