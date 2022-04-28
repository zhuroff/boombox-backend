import { Router } from 'express'
import { SearchController } from '~/controllers/search.controller'

const router = Router()

router.post('/', SearchController.search)
// router.post('/discogs', controller.discogs)

export default router
