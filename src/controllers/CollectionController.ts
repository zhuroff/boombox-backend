import { Request, Response } from 'express'
import { PaginateModel } from 'mongoose'
import { Collection, CollectionDocument } from '../models/collection.model'
import CollectionService from '../services/CollectionService'
import FileService from '../services/FileService'

export default class CollectionController {
  constructor(
    private collectionService: CollectionService,
    private fileService: FileService
  ) {}

  createCollection = async (req: Request, res: Response) => {
    try {
      const response = await this.collectionService.createCollection(req.body)
      res.status(201).json(response)
    } catch (error) {
      console.error(error)
      res.status(409).json({ message: (error as Error).message })
    }
  }

  getCollections = async (req: Request, res: Response) => {
    try {
      const response = await this.collectionService.getCollections(req)
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  getCollection = async (req: Request, res: Response) => {
    try {
      const response = await this.collectionService.getCollection(String(req.params['id']))
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  updateCollection = async (req: Request, res: Response) => {
    try {
      const response = await this.collectionService.updateCollection(req.body)
      res.status(201).json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  removeCollection = async (req: Request, res: Response) => {
    try {
      const response = await this.collectionService.removeCollection(String(req.params['id']))
      res.status(201).json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  reorderCollections = async (req: Request, res: Response) => {
    try {
      const response = await this.collectionService.reorderCollections(req.body, String(req.params['id']))
      res.status(201).json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  updateModelFileLink = async (req: Request, res: Response) => {
    try {
      const response = await this.fileService.updateModelFileLink<
        CollectionDocument,
        PaginateModel<CollectionDocument>
      >(Collection, req)

      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }
}