import 'module-alias/register'
import { Request, Response } from 'express'
import { Model } from 'mongoose'
import { CollectionModel } from '~/types/Collection'
import { Collection } from '~/models/collection.model'
import collectionsServices from '~/services/collections.services'
import filesServices from '~/services/files.services'

export class CollectionsController {
  static async list(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await collectionsServices.list()
      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async single(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await collectionsServices.single(String(req.params['id']))
      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async update(req: Request, res: Response, next: (error: unknown) => void) {
    const { listID, inList, itemID, order } = req.body

    try {
      const response = await collectionsServices.update({ listID, inList, itemID, order })
      res.status(201).json(response)
    } catch (error) {
      next(error)
    }
  }

  static async create(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await collectionsServices.create(req.body.title, req.body.album)
      res.status(201).json(response)
    } catch (error) {
      next(error)
    }
  }

  static async remove(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await collectionsServices.remove(String(req.params['id']))
      res.status(201).json(response)
    } catch (error) {
      next(error)
    }
  }

  static async reorder(req: Request, res: Response, next: (error: unknown) => void) {
    const { oldOrder, newOrder } = req.body

    try {
      const response = await collectionsServices.reorder({ oldOrder, newOrder }, String(req.params['id']))
      res.status(201).json(response)
    } catch (error) {
      next(error)
    }
  }

  static async upload(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await filesServices.upload<Model<CollectionModel>>(Collection, req)
      return res.json(response)
    } catch (error) {
      next(error)
    }
  }
}
