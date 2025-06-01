import { Router } from 'express'
import { authChecker } from '../middleware/auth.checker'
import BackupController from '../controllers/BackupController'
import BackupService from '../services/BackupService'

const router = Router()
const backupService = new BackupService()
const backupController = new BackupController(backupService)

router.get('/', authChecker, backupController.get)
router.post('/save', authChecker, backupController.save)
router.post('/restore/:date', authChecker, backupController.recover)
router.delete('/:date', authChecker, backupController.remove)

export default router
