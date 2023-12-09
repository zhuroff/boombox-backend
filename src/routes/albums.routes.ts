import { Router } from 'express'
import controller from '../controllers/albums.controller'

const router = Router()

router.post('/', controller.getList)
router.get('/', controller.getListRandom)
router.get('/:id', controller.getSingle)

export default router
