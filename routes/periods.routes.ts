import { Router } from 'express'
import { PeriodsController } from '~/controllers/periods.controller'
import upload from '~/middleware/upload'

const router = Router()

router.post('/', PeriodsController.list)
router.get('/:id', PeriodsController.single)
router.post('/:id/poster', upload.single('poster'), PeriodsController.upload)
router.post('/:id/avatar', upload.single('avatar'), PeriodsController.upload)

export default router