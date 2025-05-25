import { Router } from 'express'
import { authChecker } from '../middleware/auth.checker'
import AlbumsController from '../controllers/AlbumsController'
import AlbumRepositoryContract from '../repositories/AlbumRepository'
import CategoryRepositoryContract from '../repositories/CategoryRepository'
import CollectionRepositoryContract from '../repositories/CollectionRepository'
import CompilationRepositoryContract from '../repositories/CompilationRepository'
import TrackRepositoryContract from '../repositories/TrackRepository'
import AlbumService from '../services/AlbumService'
import CategoryService from '../services/CategoryService'
import CollectionService from '../services/CollectionService'
import CompilationService from '../services/CompilationService'
import TrackService from '../services/TrackService'

const albumRepository = new AlbumRepositoryContract()
const categoryRepository = new CategoryRepositoryContract()
const collectionRepository = new CollectionRepositoryContract()
const compilationRepository = new CompilationRepositoryContract()
const trackRepository = new TrackRepositoryContract()

const trackService = new TrackService(trackRepository)
const categoryService = new CategoryService(categoryRepository, albumRepository)
const collectionService = new CollectionService(collectionRepository, albumRepository)
const compilationService = new CompilationService(compilationRepository, trackRepository)
const albumService = new AlbumService(albumRepository, categoryService, collectionService, compilationService, trackService)

const albumController = new AlbumsController(albumService)
const router = Router()

router.get('/', authChecker, albumController.getAlbums)
router.get('/:id', authChecker, albumController.getAlbum)

export default router
