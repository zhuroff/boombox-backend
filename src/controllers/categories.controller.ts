import { Request, Response } from 'express'
import { PaginateModel } from 'mongoose'
import { CategoryDocument } from '../types/common.types'
import categoriesServices from '../services/categories.services'
import filesServices from '../services/files.services'

export default {
  getSingle: (model: PaginateModel<CategoryDocument>) => async (req: Request, res: Response) => {
    try {
      const result = await categoriesServices.single(model, req)
      return res.json(result)
    } catch (error) {
      throw error
    }
  },
  getList: (model: PaginateModel<CategoryDocument>) => async (req: Request, res: Response) => {
    try {
      const result = await categoriesServices.getList(model, req)
      return res.json(result)
    } catch (error) {
      throw error
    }
  },
  create: (model: PaginateModel<CategoryDocument>) => async (req: Request, res: Response) => {
    try {
      const response = await categoriesServices.create(model, req.body.value)
      return res.json(response)
    } catch (error) {
      throw error
    }
  },
  upload: (model: PaginateModel<CategoryDocument>) => async (req: Request, res: Response) => {
    try {
      const response = await filesServices.upload<CategoryDocument, PaginateModel<CategoryDocument>>(model, req)
      return res.json(response)
    } catch (error) {
      throw error
    }
  },
  remove: (model: PaginateModel<CategoryDocument>) => async (req: Request, res: Response) => {
    try {
      const response = await categoriesServices.remove(model, String(req.params['id']))
      return res.json(response)
    } catch (error) {
      throw error
    }
  }
}
