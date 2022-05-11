import 'module-alias/register'
import { Router } from 'express'
import { ArtistsController } from '~/controllers/artists.controller'
import upload from '~/middleware/upload'

const router = Router()

router.get('/:id', ArtistsController.single)
router.post('/', ArtistsController.list)
router.post('/create', ArtistsController.create)
router.post('/:id/poster', upload.single('poster'), ArtistsController.upload)
router.post('/:id/avatar', upload.single('avatar'), ArtistsController.upload)

export default router
