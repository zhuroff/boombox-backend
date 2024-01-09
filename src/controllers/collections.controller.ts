import { Request, Response } from 'express'
import { PaginateModel } from 'mongoose'
import { Collection, CollectionDocument } from '../models/collection.model'
import collectionsServices from '../services/collections.services'
import filesServices from '../services/files.services'

export default {
  async create(req: Request, res: Response) {
    try {
      const response = await collectionsServices.create(req.body)
      res.status(201).json(response)
    } catch (error) {
      res.status(409).json({ message: (error as Error).message })
    }
  },
  async getCollectionsList(req: Request, res: Response) {
    try {
      const response = await collectionsServices.getCollectionsList(req)
      res.json(response)
    } catch (error) {
      throw error
    }
  },
  async single(req: Request, res: Response) {
    try {
      const response = await collectionsServices.single(String(req.params['id']))
      res.json(response)
    } catch (error) {
      throw error
    }
  },
  async update(req: Request, res: Response) {
    const { entityID, gatheringID, isInList, order } = req.body

    try {
      const response = await collectionsServices.update({ entityID, gatheringID, isInList, order })
      res.status(201).json(response)
    } catch (error) {
      throw error
    }
  },
  async remove(req: Request, res: Response) {
    try {
      const response = await collectionsServices.remove(String(req.params['id']))
      res.status(201).json(response)
    } catch (error) {
      throw error
    }
  },
  async reorder(req: Request, res: Response) {
    const { oldOrder, newOrder } = req.body

    try {
      const response = await collectionsServices.reorder({ oldOrder, newOrder }, String(req.params['id']))
      res.status(201).json(response)
    } catch (error) {
      throw error
    }
  },
  async upload(req: Request, res: Response) {
    try {
      const response = await filesServices.upload<CollectionDocument, PaginateModel<CollectionDocument>>(Collection, req)
      return res.json(response)
    } catch (error) {
      throw error
    }
  }
}
