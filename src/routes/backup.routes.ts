import { Router } from 'express'
import { BackupController } from '../controllers/backup.controller'

const router = Router()

router.get('/', BackupController.getBackup)
router.post('/save', BackupController.saveBackup)
router.post('/restore/:date', BackupController.restoreBackup)
router.delete('/:date', BackupController.removeBackup)

export default router
