import { Router } from 'express'
import { Period } from '../models/period.model'
import { authChecker } from '../middleware/auth.checker'
import controller from '../controllers/categories.controller'
import upload from '../middleware/upload'

const router = Router()

router.get('/:id', authChecker, controller.getSingle(Period))
router.post('/', authChecker, controller.getList(Period))
router.post('/create', authChecker, controller.create(Period))
router.post('/:id/poster', authChecker, upload.single('poster'), controller.upload(Period))
router.post('/:id/avatar', authChecker, upload.single('avatar'), controller.upload(Period))
router.delete('/:id', authChecker, controller.remove)

export default router
