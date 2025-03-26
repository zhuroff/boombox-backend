import { Router } from 'express'
import { authChecker } from '../middleware/auth.checker'
import upload from '../middleware/upload'
import CollectionRepositoryContract from '../repositories/CollectionRepository'
import FileRepositoryContract from '../repositories/FileRepository'
import AlbumRepositoryContract from '../repositories/AlbumRepository'
import CollectionService from '../services/CollectionService'
import FileService from '../services/FileService'
import CollectionController from '../controllers/CollectionController'

const collectionRepository = new CollectionRepositoryContract()
const fileRepository = new FileRepositoryContract()
const fileService  = new FileService(fileRepository)
const albumRepository = new AlbumRepositoryContract()
const collectionService = new CollectionService(collectionRepository, albumRepository)
const collectionController = new CollectionController(collectionService, fileService)
const router = Router()

// router.patch('/:id/rename', controller.rename)
router.post('/create', authChecker, collectionController.createCollection)
router.patch('/update', authChecker, collectionController.updateCollection)
router.post('/', authChecker, collectionController.getCollections)
router.get('/:id', authChecker, collectionController.getCollection)
router.patch('/:id/reorder', authChecker, collectionController.reorderCollections)
router.delete('/:id', authChecker, collectionController.removeCollection)
router.post('/:id/poster', authChecker, upload.single('poster'), collectionController.updateModelFileLink)
router.post('/:id/avatar', authChecker, upload.single('avatar'), collectionController.updateModelFileLink)

export default router
