import { Router } from 'express'
import { authChecker } from '../middleware/auth.checker'
import AlbumRepositoryContract from '../repositories/AlbumRepository'
import CategoryRepositoryContract from '../repositories/CategoryRepository'
import SyncRepositoryContract from '../repositories/SyncRepository'
import TrackRepositoryContract from '../repositories/TrackRepository'
import AlbumService from '../services/AlbumService'
import CategoryService from '../services/CategoryService'
import SyncService from '../services/SyncService'
import TrackService from '../services/TrackService'
import SyncController from '../controllers/SyncController'

const albumRepository = new AlbumRepositoryContract()
const syncRepository = new SyncRepositoryContract()
const categoryRepository = new CategoryRepositoryContract()
const trackRepository = new TrackRepositoryContract()
const categoryService = new CategoryService(categoryRepository)
const trackService = new TrackService(trackRepository)
const albumService = new AlbumService(albumRepository, categoryService, trackService)
const syncService = new SyncService(syncRepository, albumService)
const syncController = new SyncController(syncService)

const router = Router()

router.post('/', authChecker, syncController.sync)

export default router
