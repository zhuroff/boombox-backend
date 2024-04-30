import { Router } from 'express'
import { Artist } from '../models/artist.model'
import { authChecker } from '../middleware/auth.checker'
import controller from '../controllers/categories.controller'
import upload from '../middleware/upload'

const router = Router()

router.get('/:id', authChecker, controller.getSingle(Artist))
router.post('/', authChecker, controller.getList(Artist))
router.post('/create', authChecker, controller.create(Artist))
router.post('/:id/poster', authChecker, upload.single('poster'), controller.upload(Artist))
router.post('/:id/avatar', authChecker, upload.single('avatar'), controller.upload(Artist))
router.delete('/:id', authChecker, controller.remove)

export default router
