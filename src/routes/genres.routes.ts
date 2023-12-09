import { Router } from 'express'
import { Genre } from '../models/genre.model'
import controller from '../controllers/categories.controller'
import upload from '../middleware/upload'

const router = Router()

router.get('/:id', controller.getSingle(Genre))
router.post('/', controller.getList(Genre))
router.post('/create', controller.create(Genre))
router.post('/:id/poster', upload.single('poster'), controller.upload(Genre))
router.post('/:id/avatar', upload.single('avatar'), controller.upload(Genre))
router.delete('/:id', controller.remove)

export default router
