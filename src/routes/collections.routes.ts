import { Router } from 'express'
import { authChecker } from '../middleware/auth.checker'
import upload, { handleMulterError } from '../middleware/upload'
import CollectionRepositoryContract from '../repositories/CollectionRepository'
import FileRepositoryContract from '../repositories/FileRepository'
import AlbumRepositoryContract from '../repositories/AlbumRepository'
import CollectionService from '../services/CollectionService'
import FileService from '../services/FileService'
import CollectionController from '../controllers/CollectionController'

const collectionRepository = new CollectionRepositoryContract()
const fileRepository = new FileRepositoryContract()
const albumRepository = new AlbumRepositoryContract()

const fileService  = new FileService(fileRepository)
const collectionService = new CollectionService(collectionRepository, albumRepository)

const collectionController = new CollectionController(collectionService, fileService)
const router = Router()

// router.patch('/:id/rename', controller.rename)
router.get('/', authChecker, collectionController.getCollections)
router.post('/create', authChecker, collectionController.createCollection)
router.patch('/update', authChecker, collectionController.updateCollection)
router.put('/:id/post', authChecker, collectionController.updatePost)
router.get('/:id', authChecker, collectionController.getCollection)
router.patch('/:id/reorder', authChecker, collectionController.reorderCollections)
router.delete('/:id', authChecker, collectionController.removeCollection)
router.post('/:id/poster', authChecker, upload.single('poster'), handleMulterError, collectionController.updateModelFileLink)
router.post('/:id/avatar', authChecker, upload.single('avatar'), handleMulterError, collectionController.updateModelFileLink)

export default router
