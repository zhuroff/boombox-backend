import { Request, Response } from 'express'
import { UserResponse } from '../types/reqres.types'
import userServices from '../services/users.services'

export default {
  cookieSetter(res: Response, payload: UserResponse) {
    res.cookie(
      'refreshToken',
      payload?.refreshToken,
      {
        maxAge: 30 * 24 + 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env['NODE_ENV'] === 'production'
      }
    )
  },
  async registration(req: Request, res: Response) {
    try {
      const response = await userServices.registration(req)
      this.cookieSetter(res, response)
      res.status(201).json(response)
    } catch (error) {
      res.status(400).json(error)
    }
  },
  async login(req: Request, res: Response) {
    try {
      const response = await userServices.login(req)
      this.cookieSetter(res, response)
      res.status(200).json(response)
    } catch (error) {
      res.status(400).json(error)
    }
  },
  async refresh(req: Request, res: Response) {
    try {
      const response = await userServices.refresh(req)
      this.cookieSetter(res, response)
      res.status(200).json(response)
    } catch (error) {
      res.status(400).json(error)
    }
  }
}
