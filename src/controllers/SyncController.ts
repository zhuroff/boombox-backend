import { Request, Response } from 'express'
import SyncService from '../services/SyncService'

export default class SyncController {
  constructor(private readonly syncService: SyncService) {}

  sync = async (_: Request, res: Response) => {
    try {
      const result = await this.syncService.synchronize()
      return res.status(200).json(result)
    } catch (error) {
      console.error(error)

      if (error instanceof Error) {
        return res.status(500).json({ errMessage: error.message })
      }

      return res.status(500).json({ errMessage: 'Internal server error' })
    }
  }
}
