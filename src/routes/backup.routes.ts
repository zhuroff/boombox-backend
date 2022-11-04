import { Router } from 'express'
import { BackupController } from '../controllers/backup.controller'

const router = Router()

router.get('/list', BackupController.list)
router.post('/save', BackupController.save)
router.post('/restore/:date', BackupController.restore)
router.delete('/:date', BackupController.remove)

export default router
