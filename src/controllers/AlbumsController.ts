import { Request, Response } from 'express'
import AlbumService from '../services/AlbumService'

export default class AlbumsController {
  constructor(private albumService: AlbumService) {}

  getAlbums = async (req: Request, res: Response) => {
    try {
      const result = await this.albumService.getAlbums(req)
      res.json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  getAlbumsRandom = async (req: Request, res: Response) => {
    if (Array.isArray(req.query)) {
      throw new Error('Query should be a string in this request')
    }

    try {
      const quantity = parseInt(String(req.query?.['quantity'] || 8))
      const result = await this.albumService.getAlbumsRandom(quantity)
      res.json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  getAlbum = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const result = await this.albumService.getAlbum(req.params['id'])
      res.json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }
}
