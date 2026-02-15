import { Request, Response } from 'express'
import { UserResponse } from '../types/user'
import UserService from '../services/UserService'

export default class UserController {
  private cookieSetter = (res: Response, payload: UserResponse) => {
    res.cookie(
      'refreshToken',
      payload?.refreshToken,
      {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env['NODE_ENV'] === 'production'
      }
    )

    res.cookie(
      'accessToken',
      payload?.accessToken,
      {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env['NODE_ENV'] === 'production'
      }
    )
  }

  constructor(private userService: UserService) {}

  registration = async (req: Request, res: Response) => {
    try {
      const response = await this.userService.registration(req)
      res.status(201).json(response)
    } catch (error) {
      console.error(error)
      res.status(400).json(error)
    }
  }

  login = async (req: Request, res: Response) => {
    try {
      const response = await this.userService.login(req)
      this.cookieSetter(res, response)
      res.status(200).json(response)
    } catch (error) {
      console.error(error)
      res.status(400).json(error)
    }
  }

  logout = async (req: Request, res: Response) => {
    try {
      const response = await this.userService.logout(req, res)
      res.clearCookie('refreshToken')
      res.clearCookie('accessToken')
      res.status(200).json(response)
    } catch (error) {
      console.error(error)
      res.status(500).json(error)
    }
  }

  getRawUsers = async (_: Request, res: Response) => {
    try {
      const response = await this.userService.getRawUsers()
      res.status(200).json(response)
    } catch (error) {
      console.error(error)
      res.status(404).json(error)
    }
  }

  refreshToken = async (req: Request, res: Response) => {
    try {
      const response = await this.userService.refreshToken(req)
      this.cookieSetter(res, response)
      res.status(200).json(response)
    } catch (error) {
      console.error(error)
      res.status(401).json(error)
    }
  }

  removeUser = async (req: Request, res: Response) => {
    try {
      await this.userService.removeUser(req, res)
      res.status(204).json()
    } catch (error) {
      console.error(error)
      res.status(400).json(error)
    }
  }
}