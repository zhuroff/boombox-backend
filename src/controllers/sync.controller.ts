import { Request, Response } from 'express'
import AlbumRepositoryContract from '../repositories/AlbumRepository'
import CategoryRepositoryContract from '../repositories/CategoryRepository'
import SyncRepositoryContract from '../repositories/SyncRepository'
import AlbumService from '../services/AlbumService'
import CategoryService from '../services/CategoryService'
import SyncService from '../services/SyncService'

export default {
  async sync(_: Request, res: Response) {
    const albumRepository = new AlbumRepositoryContract()
    const syncRepository = new SyncRepositoryContract()
    const categoryRepository = new CategoryRepositoryContract()
    const categoryService = new CategoryService(categoryRepository)
    const albumService = new AlbumService(albumRepository, categoryService)
    const syncService = new SyncService(syncRepository, albumService)

    try {
      const result = await syncService.synchronize()
      res.status(200).json(result)
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        res.status(500).json({ errMessage: error.message })
      }

      res.status(500).json({ errMessage: 'Internal server error' })
    }
  }
}
