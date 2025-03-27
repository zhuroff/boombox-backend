import { Router } from 'express'
import { authChecker } from '../middleware/auth.checker'
import CompilationRepositoryContract from '../repositories/CompilationRepository'
import FileRepositoryContract from 'src/repositories/FileRepository'
import TrackRepositoryContract from '../repositories/TrackRepository'
import CompilationService from '../services/CompilationService'
import FileService from '../services/FileService'
import CompilationController from '../controllers/CompilationController'
import upload from '../middleware/upload'

const compilationRepository = new CompilationRepositoryContract()
const fileRepository = new FileRepositoryContract()
const trackRepository = new TrackRepositoryContract()

const fileService = new FileService(fileRepository)
const compilationService = new CompilationService(compilationRepository, trackRepository)

const compilationController = new CompilationController(compilationService, fileService)
const router = Router()

// router.patch('/:id/rename', compilationController.renameCompilation)
router.post('/create', authChecker, compilationController.createCompilation)
router.patch('/update', authChecker, compilationController.updateCompilation)
router.post('/', authChecker, compilationController.getCompilations)
router.get('/:id', authChecker, compilationController.getCompilation)
router.patch('/:id/reorder', authChecker, compilationController.reorderCompilationTracks)
router.delete('/:id', authChecker, compilationController.removeCompilation)
router.post('/:id/poster', authChecker, upload.single('poster'), compilationController.updateModelFileLink)
router.post('/:id/avatar', authChecker, upload.single('avatar'), compilationController.updateModelFileLink)

export default router
