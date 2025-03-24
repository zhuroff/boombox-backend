import { Request, Response } from 'express'
import AlbumRepositoryContract from '../repositories/AlbumRepository'
import CategoryRepositoryContract from '../repositories/CategoryRepository'
import AlbumService from '../services/AlbumService'
import CategoryService from '../services/CategoryService'

export default {
  async getAlbums(req: Request, res: Response) {
    const albumRepository = new AlbumRepositoryContract()
    const categoryRepository = new CategoryRepositoryContract()
    const categoryService = new CategoryService(categoryRepository)
    const albumService = new AlbumService(albumRepository, categoryService)

    try {
      const result = await albumService.getAlbums(req)
      res.json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  },

  async getAlbumsRandom(req: Request, res: Response) {
    if (Array.isArray(req.query)) {
      throw new Error('Query should be a string in this request')
    }

    const albumRepository = new AlbumRepositoryContract()
    const categoryRepository = new CategoryRepositoryContract()
    const categoryService = new CategoryService(categoryRepository)
    const albumService = new AlbumService(albumRepository, categoryService)

    try {
      const quantity = parseInt(String(req.query?.['quantity'] || 8))
      const result = await albumService.getAlbumsRandom(quantity)
      res.json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  },

  async getAlbum(req: Request<{ id: string }>, res: Response) {
    const albumRepository = new AlbumRepositoryContract()
    const categoryRepository = new CategoryRepositoryContract()
    const categoryService = new CategoryService(categoryRepository)
    const albumService = new AlbumService(albumRepository, categoryService)

    try {
      const result = await albumService.getAlbum(req.params['id'])
      res.json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }
}
