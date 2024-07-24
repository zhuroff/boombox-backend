import { Request, Response } from 'express'
import { PaginateModel } from 'mongoose'
import { CategoryDocument } from '../types/common.types'
import categoriesServices from '../services/categories.services'
import filesServices from '../services/files.services'

export default {
  getSingle: (model: PaginateModel<CategoryDocument>) => async (req: Request, res: Response) => {
    try {
      const result = await categoriesServices.single(model, req)
      res.json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  },
  getList: (model: PaginateModel<CategoryDocument>) => async (req: Request, res: Response) => {
    try {
      const result = await categoriesServices.getList(model, req)
      res.json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  },
  create: (model: PaginateModel<CategoryDocument>) => async (req: Request, res: Response) => {
    try {
      const response = await categoriesServices.create(model, req.body.value)
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  },
  upload: (model: PaginateModel<CategoryDocument>) => async (req: Request, res: Response) => {
    try {
      const response = await filesServices.upload<CategoryDocument, PaginateModel<CategoryDocument>>(model, req)
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  },
  remove: (model: PaginateModel<CategoryDocument>) => async (req: Request, res: Response) => {
    try {
      const response = await categoriesServices.remove(model, String(req.params['id']))
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }
}
