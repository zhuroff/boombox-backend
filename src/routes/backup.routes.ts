import { Router } from 'express'
import controller from '../controllers/backup.controller'

const router = Router()

router.get('/', controller.get)
router.post('/save', controller.save)
router.post('/restore/:date', controller.recover)
router.delete('/:date', controller.remove)

export default router
