import { Request, Response } from 'express'
import backupServices from '../services/backup.services'

export class BackupController {
  static async save(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await backupServices.backupSave()
      res.status(201).json(response)
    } catch (error) {
      return next(error)
    }
  }

  static list(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = backupServices.backupList()
      res.json(response)
    } catch (error) {
      return next(error)
    }
  }

  static async restore(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await backupServices.backupRestore(String(req.params['date']))
      res.status(201).json(response)
    } catch (error) {
      return next(error)
    }
  }

  static async remove(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await backupServices.backupRemove(String(req.params['date']))
      res.status(201).json(response)
    } catch (error) {
      return next(error)
    }
  }
}
