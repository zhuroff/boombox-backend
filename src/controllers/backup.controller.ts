import { Request, Response } from 'express'
import backupServices from '../services/backup.services'

export class BackupController {
  static async saveBackup(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await backupServices.saveBackup()
      res.status(201).json(response)
    } catch (error) {
      return next(error)
    }
  }

  static getBackup(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = backupServices.getBackup()
      res.json(response)
    } catch (error) {
      return next(error)
    }
  }

  static async restoreBackup(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await backupServices.restoreBackup(String(req.params['date']))
      res.status(201).json(response)
    } catch (error) {
      return next(error)
    }
  }

  static async removeBackup(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await backupServices.removeBackup(String(req.params['date']))
      res.status(201).json(response)
    } catch (error) {
      return next(error)
    }
  }
}
