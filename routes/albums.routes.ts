import { Router } from 'express'
import controller from '~/controllers/albums.controller'

const router = Router()

router.post('/', controller.list)
// router.get('/:id', controller.single)
// router.get('/:id/:booklet', controller.coverArt)
// router.patch('/:id/duration', controller.duration)
// router.patch('/:id/listened', controller.listened)
// router.patch('/:id/description', controller.description)
// router.patch('/:id/lyrics', controller.lyrics)

export default router
