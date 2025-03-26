import { Router } from 'express'
import { authChecker } from '../middleware/auth.checker'
import AlbumsController from '../controllers/AlbumsController'
import AlbumRepositoryContract from '../repositories/AlbumRepository'
import CategoryRepositoryContract from '../repositories/CategoryRepository'
import TrackRepositoryContract from '../repositories/TrackRepository'
import AlbumService from '../services/AlbumService'
import CategoryService from '../services/CategoryService'
import TrackService from '../services/TrackService'

const albumRepository = new AlbumRepositoryContract()
const categoryRepository = new CategoryRepositoryContract()
const trackRepository = new TrackRepositoryContract()
const categoryService = new CategoryService(categoryRepository)
const trackService = new TrackService(trackRepository)
const albumService = new AlbumService(albumRepository, categoryService, trackService)
const albumController = new AlbumsController(albumService)
const router = Router()

router.post('/', authChecker, albumController.getAlbums)
router.get('/', authChecker, albumController.getAlbumsRandom)
router.get('/:id', authChecker, albumController.getAlbum)

export default router
