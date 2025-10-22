import { Router } from 'express'
import { Period } from '../models/period.model'
import { authChecker } from '../middleware/auth.checker'
import CategoryRepositoryContract from '../repositories/CategoryRepository'
import FileRepositoryContract from '../repositories/FileRepository'
import AlbumRepositoryContract from '../repositories/AlbumRepository'
import CategoryService from '../services/CategoryService'
import FileService from '../services/FileService'
import CategoryController from '../controllers/CategoryController'

const categoryRepository = new CategoryRepositoryContract()
const fileRepository = new FileRepositoryContract()
const albumRepository = new AlbumRepositoryContract()

const fileService = new FileService(fileRepository)
const categoryService = new CategoryService(categoryRepository, albumRepository)

const periodController = new CategoryController(categoryService, fileService)
import upload, { handleMulterError } from '../middleware/upload'

const router = Router()

router.get('/', authChecker, periodController.getCategories(Period))
router.get('/:id', authChecker, periodController.getCategory(Period))
router.post('/create', authChecker, periodController.createCategory(Period))
router.post('/:id/poster', authChecker, upload.single('poster'), handleMulterError, periodController.updateModelFileLink(Period))
router.post('/:id/avatar', authChecker, upload.single('avatar'), handleMulterError, periodController.updateModelFileLink(Period))
router.delete('/:id', authChecker, periodController.removeCategory)

export default router
