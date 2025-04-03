import { Request, Response } from 'express'
import { PaginateModel } from 'mongoose'
import { CategoryDocument } from '../types/category.types'
import FileService from '../services/FileService'
import CategoryService from '../services/CategoryService'

export default class CategoryController {
  constructor(
    private categoryService: CategoryService,
    private fileService: FileService
  ) {}

  getCategory = (model: PaginateModel<CategoryDocument>) => async (req: Request, res: Response) => {
    try {
      const result = await this.categoryService.getCategory(model, req)
      res.json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  getCategories = (model: PaginateModel<CategoryDocument>) => async (req: Request, res: Response) => {
    try {
      const result = await this.categoryService.getCategories(model, req)
      res.json(result)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  createCategory = (model: PaginateModel<CategoryDocument>) => async (req: Request, res: Response) => {
    try {
      const response = await this.categoryService.createCategory(model, req.body.value)
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  updateModelFileLink = (model: PaginateModel<CategoryDocument>) => async (req: Request, res: Response) => {
    try {
      const response = await this.fileService.updateModelFileLink<CategoryDocument, PaginateModel<CategoryDocument>>(model, req)
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  removeCategory = (model: PaginateModel<CategoryDocument>) => async (req: Request, res: Response) => {
    try {
      const response = await this.categoryService.removeCategory(model, String(req.params['id']))
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }
}
