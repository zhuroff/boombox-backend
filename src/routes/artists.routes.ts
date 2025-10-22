import { Router } from 'express'
import { Artist } from '../models/artist.model'
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

const artistController = new CategoryController(categoryService, fileService)
import upload, { handleMulterError } from '../middleware/upload'

const router = Router()

router.get('/', authChecker, artistController.getCategories(Artist))
router.get('/:id', authChecker, artistController.getCategory(Artist))
router.post('/create', authChecker, artistController.createCategory(Artist))
router.post('/:id/poster', authChecker, upload.single('poster'), handleMulterError, artistController.updateModelFileLink(Artist))
router.post('/:id/avatar', authChecker, upload.single('avatar'), handleMulterError, artistController.updateModelFileLink(Artist))
router.delete('/:id', authChecker, artistController.removeCategory)

export default router
