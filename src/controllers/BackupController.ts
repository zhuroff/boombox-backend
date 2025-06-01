import { Request, Response } from 'express'
import BackupService from '../services/BackupService'

export default class BackupController {
  constructor(private backupService: BackupService) {}

  save = async (_: Request, res: Response) => {
    try {
      const response = await this.backupService.save()
      res.status(201).json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  get = (_: Request, res: Response) => {
    try {
      const response = this.backupService.get()
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  recover = async (req: Request, res: Response) => {
    try {
      const response = await this.backupService.recover(String(req.params['date']))
      res.status(201).json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  remove = async (req: Request, res: Response) => {
    try {
      const response = await this.backupService.remove(String(req.params['date']))
      res.status(204).json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }
}
