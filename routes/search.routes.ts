import { Router } from 'express'
import controller from '~/controllers/search.controller'

const router = Router()

router.post('/', controller.search)
router.post('/news', controller.news)
router.post('/discogs', controller.discogs)

export default router
