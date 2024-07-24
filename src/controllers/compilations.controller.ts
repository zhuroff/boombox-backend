import { Request, Response } from 'express'
import { Model } from 'mongoose'
import { Compilation, CompilationDocument } from '../models/compilation.model'
import compilationsServices from '../services/compilations.services'
import filesServices from '../services/files.services'

export default {
  async create(req: Request, res: Response) {
    try {
      const response = await compilationsServices.create(req.body)
      res.status(201).json(response)
    } catch (error) {
      console.error(error)
      res.status(409).json({ message: (error as Error).message })
    }
  },
  async update(req: Request, res: Response) {
    const { entityID, gatheringID, isInList, order } = req.body

    try {
      const response = await compilationsServices.update({ entityID, gatheringID, isInList, order })
      res.status(201).json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  },
  async getCompilationsList(req: Request, res: Response) {
    try {
      const response = await compilationsServices.getCompilationsList(req)
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  },
  async single(req: Request, res: Response) {
    try {
      const response = await compilationsServices.single(String(req.params['id']))
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  },
  async remove(req: Request, res: Response) {
    try {
      const response = await compilationsServices.remove(String(req.params['id']))
      res.status(201).json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  },
  async reorder(req: Request, res: Response) {
    const { oldOrder, newOrder } = req.body

    try {
      const response = await compilationsServices.reorder({ oldOrder, newOrder }, String(req.params['id']))
      res.status(201).json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  },
  async rename(req: Request, res: Response) {
    try {
      const response = await compilationsServices.rename(String(req.params['id']), req.body['title'])
      res.status(201).json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  },
  async upload(req: Request, res: Response) {
    try {
      const response = await filesServices.upload<CompilationDocument, Model<CompilationDocument>>(Compilation, req)
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }
}
