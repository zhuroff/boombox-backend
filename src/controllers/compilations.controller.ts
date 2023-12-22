import { Request, Response } from 'express'
import { Model } from 'mongoose'
import { PlayListUpdatePayload } from '../types/compilation.types'
import { Compilation, CompilationDocument } from '../models/compilation.model'
import playlistsServices from '../services/compilations.services'
import filesServices from '../services/files.services'

export default {
  async create(req: Request, res: Response) {
    const { title, track } = req.body

    try {
      const response = await playlistsServices.create({ title, track })
      res.status(201).json(response)
    } catch (error) {
      throw error
    }
  },
  async update(req: Request, res: Response) {
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
      throw error
    }
  },
  async getAllPlaylists(req: Request, res: Response) {
    try {
      const response = await playlistsServices.getAllPlaylists()
      res.json(response)
    } catch (error) {
      throw error
    }
  },
  async single(req: Request, res: Response) {
    try {
      const response = await playlistsServices.single(String(req.params['id']))
      res.json(response)
    } catch (error) {
      throw error
    }
  },
  async remove(req: Request, res: Response) {
    try {
      const response = await playlistsServices.remove(String(req.params['id']))
      res.status(201).json(response)
    } catch (error) {
      throw error
    }
  },
  async reorder(req: Request, res: Response) {
    const { oldOrder, newOrder } = req.body

    try {
      const response = await playlistsServices.reorder({ oldOrder, newOrder }, String(req.params['id']))
      res.status(201).json(response)
    } catch (error) {
      throw error
    }
  },
  async rename(req: Request, res: Response) {
    try {
      const response = await playlistsServices.rename(String(req.params['id']), req.body['title'])
      res.status(201).json(response)
    } catch (error) {
      throw error
    }
  },
  async upload(req: Request, res: Response) {
    try {
      const response = await filesServices.upload<CompilationDocument, Model<CompilationDocument>>(Compilation, req)
      return res.json(response)
    } catch (error) {
      throw error
    }
  }
}
