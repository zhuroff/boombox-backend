import { Request, Response } from 'express'
import { Model } from 'mongoose'
import { PlayListModel } from '../types/Playlist'
import { PlayListUpdatePayload } from '../types/Playlist'
import { Playlist } from '../models/playlist.model'
import playlistsServices from '../services/playlists.services'
import filesServices from '../services/files.services'

export class PlaylistsController {
  static async create(req: Request, res: Response, next: (error: unknown) => void) {
    const { title, track } = req.body

    try {
      const response = await playlistsServices.create({ title, track })
      res.status(201).json(response)
    } catch (error) {
      return next(error)
    }
  }

  static async update(req: Request, res: Response, next: (error: unknown) => void) {
    const payload: PlayListUpdatePayload = {
      _id: String(req.body['listID']),
      inList: req.body['inList'],
      track: req.body['itemID'],
      order: req.body['order']
    }

    try {
      const response = await playlistsServices.update(payload)
      res.status(201).json(response)
    } catch (error) {
      return next(error)
    }
  }

  static async list(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await playlistsServices.list()
      res.json(response)
    } catch (error) {
      return next(error)
    }
  }

  static async single(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await playlistsServices.single(String(req.params['id']))
      res.json(response)
    } catch (error) {
      return next(error)
    }
  }

  static async remove(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await playlistsServices.remove(String(req.params['id']))
      res.status(201).json(response)
    } catch (error) {
      return next(error)
    }
  }

  static async reorder(req: Request, res: Response, next: (error: unknown) => void) {
    const { oldOrder, newOrder } = req.body

    try {
      const response = await playlistsServices.reorder({ oldOrder, newOrder }, String(req.params['id']))
      res.status(201).json(response)
    } catch (error) {
      return next(error)
    }
  }

  static async rename(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await playlistsServices.rename(String(req.params['id']), req.body['title'])
      res.status(201).json(response)
    } catch (error) {
      return next(error)
    }
  }

  static async upload(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await filesServices.upload<Model<PlayListModel>>(Playlist, req)
      return res.json(response)
    } catch (error) {
      return next(error)
    }
  }
}
