import { Router } from 'express'
import { Genre } from '../models/genre.model'
import { authChecker } from '../middleware/auth.checker'
import controller from '../controllers/categories.controller'
import upload from '../middleware/upload'

const router = Router()

router.get('/:id', authChecker, controller.getSingle(Genre))
router.post('/', authChecker, controller.getList(Genre))
router.post('/create', authChecker, controller.create(Genre))
router.post('/:id/poster', authChecker, upload.single('poster'), controller.upload(Genre))
router.post('/:id/avatar', authChecker, upload.single('avatar'), controller.upload(Genre))
router.delete('/:id', authChecker, controller.remove)

export default router
