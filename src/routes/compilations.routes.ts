import { Router } from 'express'
import { authChecker } from '../middleware/auth.checker'
import controller from '../controllers/compilations.controller'
import upload from '../middleware/upload'

const router = Router()

// router.patch('/:id/rename', controller.rename)
router.post('/create', authChecker, controller.create)
router.patch('/update', authChecker, controller.update)
router.post('/', authChecker, controller.getCompilationsList)
router.get('/:id', authChecker, controller.single)
router.patch('/:id/reorder', authChecker, controller.reorder)
router.delete('/:id', authChecker, controller.remove)
router.post('/:id/poster', authChecker, upload.single('poster'), controller.upload)
router.post('/:id/avatar', authChecker, upload.single('avatar'), controller.upload)

export default router
