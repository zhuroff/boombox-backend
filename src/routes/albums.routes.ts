import { Router } from 'express'
import { authChecker } from '../middleware/auth.checker'
import AlbumsController from '../controllers/AlbumsController'
import AlbumRepositoryContract from '../repositories/AlbumRepository'
import CategoryRepositoryContract from '../repositories/CategoryRepository'
import CollectionRepositoryContract from '../repositories/CollectionRepository'
import TrackRepositoryContract from '../repositories/TrackRepository'
import AlbumService from '../services/AlbumService'
import CategoryService from '../services/CategoryService'
import CollectionService from '../services/CollectionService'
import TrackService from '../services/TrackService'

const albumRepository = new AlbumRepositoryContract()
const categoryRepository = new CategoryRepositoryContract()
const collectionRepository = new CollectionRepositoryContract()
const trackRepository = new TrackRepositoryContract()
const categoryService = new CategoryService(categoryRepository)
const trackService = new TrackService(trackRepository)
const collectionService = new CollectionService(collectionRepository, albumRepository)
const albumService = new AlbumService(albumRepository, categoryService, collectionService, trackService)
const albumController = new AlbumsController(albumService)
const router = Router()

router.post('/', authChecker, albumController.getAlbums)
router.get('/', authChecker, albumController.getAlbumsRandom)
router.get('/:id', authChecker, albumController.getAlbum)

export default router
