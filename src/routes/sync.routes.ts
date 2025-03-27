import { Router } from 'express'
import { authChecker } from '../middleware/auth.checker'
import AlbumRepositoryContract from '../repositories/AlbumRepository'
import CategoryRepositoryContract from '../repositories/CategoryRepository'
import CollectionRepositoryContract from '../repositories/CollectionRepository'
import CompilationRepositoryContract from '../repositories/CompilationRepository'
import SyncRepositoryContract from '../repositories/SyncRepository'
import TrackRepositoryContract from '../repositories/TrackRepository'
import AlbumService from '../services/AlbumService'
import CategoryService from '../services/CategoryService'
import SyncService from '../services/SyncService'
import TrackService from '../services/TrackService'
import CollectionService from '../services/CollectionService'
import CompilationService from '../services/CompilationService'
import SyncController from '../controllers/SyncController'

const albumRepository = new AlbumRepositoryContract()
const syncRepository = new SyncRepositoryContract()
const categoryRepository = new CategoryRepositoryContract()
const collectionRepository = new CollectionRepositoryContract()
const compilationRepository = new CompilationRepositoryContract()
const trackRepository = new TrackRepositoryContract()

const categoryService = new CategoryService(categoryRepository)
const collectionService = new CollectionService(collectionRepository, albumRepository)
const compilationService = new CompilationService(compilationRepository, trackRepository)
const trackService = new TrackService(trackRepository)
const albumService = new AlbumService(albumRepository, categoryService, collectionService, compilationService, trackService)
const syncService = new SyncService(syncRepository, albumService)

const syncController = new SyncController(syncService)
const router = Router()

router.post('/', authChecker, syncController.sync)

export default router
