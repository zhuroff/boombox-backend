import { Router } from 'express'
import { GenresController } from '~/controllers/genres.controller'
import upload from '~/middleware/upload'

const router = Router()

router.post('/', GenresController.list)
router.get('/:id', GenresController.single)
router.post('/:id/poster', upload.single('poster'), GenresController.upload)
router.post('/:id/avatar', upload.single('avatar'), GenresController.upload)

export default router