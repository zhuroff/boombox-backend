import { Request, Response } from 'express'
import { Model } from 'mongoose'
import { Compilation, CompilationDocument } from '../models/compilation.model'
import CompilationService from '../services/CompilationService'
import FileService from '../services/FileService'

export default class CompilationController {
  constructor(
    private compilationService: CompilationService,
    private fileService: FileService
  ) {}

  async createCompilation(req: Request, res: Response) {
    try {
      const response = await this.compilationService.createCompilation(req.body)
      res.status(201).json(response)
    } catch (error) {
      console.error(error)
      res.status(409).json({ message: (error as Error).message })
    }
  }

  async updateCompilation(req: Request, res: Response) {
    try {
      const response = await this.compilationService.updateCompilation(req.body)
      res.status(201).json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  async getCompilations(req: Request, res: Response) {
    try {
      const response = await this.compilationService.getCompilations(req)
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  async getCompilation(req: Request, res: Response) {
    try {
      const response = await this.compilationService.getCompilation(String(req.params['id']))
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  async removeCompilation(req: Request, res: Response) {
    try {
      const response = await this.compilationService.removeCompilation(String(req.params['id']))
      res.status(201).json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  async reorderCompilationTracks(req: Request, res: Response) {
    try {
      const response = await this.compilationService.reorderCompilationTracks(req.body, String(req.params['id']))
      res.status(201).json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  async renameCompilation(req: Request, res: Response) {
    try {
      const response = await this.compilationService.renameCompilation(String(req.params['id']), req.body['title'])
      res.status(201).json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  async updateModelFileLink(req: Request, res: Response) {
    try {
      const response = await this.fileService.updateModelFileLink<CompilationDocument, Model<CompilationDocument>>(Compilation, req)
      res.json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }
}
