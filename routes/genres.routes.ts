import 'module-alias/register'
import { Router } from 'express'
import { GenresController } from '~/controllers/genres.controller'
import upload from '~/middleware/upload'

const router = Router()

router.get('/:id', GenresController.single)
router.post('/', GenresController.list)
router.post('/create', GenresController.create)
router.post('/:id/poster', upload.single('poster'), GenresController.upload)
router.post('/:id/avatar', upload.single('avatar'), GenresController.upload)

export default router