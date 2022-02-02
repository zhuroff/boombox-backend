import { Router } from 'express'
import controller from '~/controllers/albums.controller'

const router = Router()

router.post('/', controller.list)
router.get('/:id', controller.single)
router.get('/:id/:booklet', controller.booklet)
router.patch('/:id/description', controller.description)

export default router
