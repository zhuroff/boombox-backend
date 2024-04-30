import { Request, Response } from 'express'
import userServices from '../services/users.services'
import utils from '../utils'

export default {
  async registration(req: Request, res: Response) {
    try {
      const response = await userServices.registration(req)
      res.status(201).json(response)
    } catch (error) {
      res.status(400).json(error)
    }
  },
  async login(req: Request, res: Response) {
    try {
      const response = await userServices.login(req)
      utils.cookieSetter(res, response)
      res.status(200).json(response)
    } catch (error) {
      res.status(400).json(error)
    }
  },
  async logout(req: Request, res: Response) {
    try {
      const response = await userServices.logout(req, res)
      res.status(200).json(response)
    } catch (error) {
      res.status(500).json(error)
    }
  },
  async getList(req: Request, res: Response) {
    try {
      const response = await userServices.getList()
      res.status(200).json(response)
    } catch (error) {
      res.status(404).json(error)
    }
  },
  async refresh(req: Request, res: Response) {
    try {
      const response = await userServices.refresh(req)
      utils.cookieSetter(res, response)
      res.status(200).json(response)
    } catch (error) {
      res.status(400).json(error)
    }
  }
}
