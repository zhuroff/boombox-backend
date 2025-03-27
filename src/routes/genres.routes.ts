import { Router } from 'express'
import { Genre } from '../models/genre.model'
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

const genreController = new CategoryController(categoryService, fileService)
import upload from '../middleware/upload'

const router = Router()

router.get('/:id', authChecker, genreController.getCategory(Genre))
router.post('/', authChecker, genreController.getCategories(Genre))
router.post('/create', authChecker, genreController.createCategory(Genre))
router.post('/:id/poster', authChecker, upload.single('poster'), genreController.updateModelFileLink(Genre))
router.post('/:id/avatar', authChecker, upload.single('avatar'), genreController.updateModelFileLink(Genre))
router.delete('/:id', authChecker, genreController.removeCategory)

export default router
