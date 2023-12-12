import { Request, Response } from 'express'
import backupServices from '../services/backup.services'

export default {
  async save(_: Request, res: Response) {
    try {
      const response = await backupServices.save()
      res.status(201).json(response)
    } catch (error) {
      throw error
    }
  },

  get(_: Request, res: Response) {
    try {
      const response = backupServices.get()
      res.json(response)
    } catch (error) {
      throw error
    }
  },

  async recover(req: Request, res: Response) {
    try {
      const response = await backupServices.recover(String(req.params['date']))
      res.status(201).json(response)
    } catch (error) {
      throw error
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const response = await backupServices.remove(String(req.params['date']))
      res.status(201).json(response)
    } catch (error) {
      throw error
    }
  }
}
