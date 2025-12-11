import { Request, Response } from 'express'
import BackupService from '../services/BackupService'

export default class BackupController {
  constructor(private backupService: BackupService) {}

  save = async (_: Request, res: Response) => {
    try {
      const response = await this.backupService.save()
      res.status(201).json(response)
    } catch (error) {
      console.error('Backup save error:', error)
      res.status(500).json({ 
        error: 'Failed to create backup',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error
      })
    }
  }

  get = (_: Request, res: Response) => {
    try {
      const response = this.backupService.get()
      res.json(response)
    } catch (error) {
      console.error('Backup get error:', error)
      res.status(500).json({ 
        error: 'Failed to get backups',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error
      })
    }
  }

  recover = async (req: Request, res: Response) => {
    try {
      const response = await this.backupService.recover(String(req.params['date']))
      res.status(201).json(response)
    } catch (error) {
      console.error('Backup recover error:', error)
      res.status(500).json({ 
        error: 'Failed to recover backup',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error
      })
    }
  }

  remove = async (req: Request, res: Response) => {
    try {
      await this.backupService.remove(String(req.params['date']))
      res.status(204).json()
    } catch (error) {
      console.error('Backup remove error:', error)
      res.status(500).json({ 
        error: 'Failed to remove backup',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error
      })
    }
  }
}
