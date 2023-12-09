import { Router } from 'express'
import { Artist } from '../models/artist.model'
import controller from '../controllers/categories.controller'
import upload from '../middleware/upload'

const router = Router()

router.get('/:id', controller.getSingle(Artist))
router.post('/', controller.getList(Artist))
router.post('/create', controller.create(Artist))
router.post('/:id/poster', upload.single('poster'), controller.upload(Artist))
router.post('/:id/avatar', upload.single('avatar'), controller.upload(Artist))
router.delete('/:id', controller.remove)

export default router
