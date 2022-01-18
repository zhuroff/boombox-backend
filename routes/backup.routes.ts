import { Router } from 'express'
import controller from '~/controllers/backup.controller'

const router = Router()

router.get('/list', controller.backupList)
router.post('/save', controller.backupSave)
router.post('/restore/:date', controller.backupRestore)
router.delete('/:date', controller.backupDelete)

export default router
