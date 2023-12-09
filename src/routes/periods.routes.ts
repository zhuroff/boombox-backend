import { Router } from 'express'
import { Period } from '../models/period.model'
import controller from '../controllers/categories.controller'
import upload from '../middleware/upload'

const router = Router()

router.get('/:id', controller.getSingle(Period))
router.post('/', controller.getList(Period))
router.post('/create', controller.create(Period))
router.post('/:id/poster', upload.single('poster'), controller.upload(Period))
router.post('/:id/avatar', upload.single('avatar'), controller.upload(Period))
router.delete('/:id', controller.remove)

export default router
