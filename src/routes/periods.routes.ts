import { Router } from 'express'
import { PeriodsController } from '../controllers/periods.controller'
import upload from '../middleware/upload'

const router = Router()

router.get('/:id', PeriodsController.single)
router.post('/', PeriodsController.list)
router.post('/create', PeriodsController.create)
router.post('/:id/poster', upload.single('poster'), PeriodsController.upload)
router.post('/:id/avatar', upload.single('avatar'), PeriodsController.upload)

export default router