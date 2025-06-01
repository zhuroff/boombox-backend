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

  getAlbum = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const result = await this.albumService.getAlbum(req.params['id'])
      res.json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  getAlbumContent = async (req: Request, res: Response) => {
    try {
      const result = await this.albumService.getAlbumContent(req)
      res.json(result)
    } catch (error) {
      console.error(error)
      res.json([])
    }
  }
}
