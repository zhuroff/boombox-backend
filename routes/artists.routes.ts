import { Router } from 'express'
import controller from '~/controllers/artists.controller'
import upload from '~/middleware/upload'

const router = Router()

router.post('/', controller.list)
router.get('/:id', controller.single)
router.post('/:id/poster', upload.single('poster'), controller.upload)
router.post('/:id/avatar', upload.single('avatar'), controller.upload)

export default router
