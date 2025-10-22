import { Router } from 'express'
import { authChecker } from '../middleware/auth.checker'
import TrackRepositoryContract from '../repositories/TrackRepository'
import AlbumRepositoryContract from '../repositories/AlbumRepository'
import SearchRepositoryContract from '../repositories/SearchRepository'
import SearchService from '../services/SearchService'
import SearchController from '../controllers/SearchController'
import searchMap from '../maps/search.map'

const trackRepository = new TrackRepositoryContract()
const albumRepository = new AlbumRepositoryContract()
const searchRepository = new SearchRepositoryContract(albumRepository, trackRepository)

const searchService = new SearchService(searchMap, searchRepository)

const searchController = new SearchController(searchService)
const router = Router()

router.post('/', authChecker, searchController.search)

export default router
