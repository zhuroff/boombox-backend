import { Request, Response } from 'express'
import UserService from '../services/UserService'
import utils from '../utils'

export default class UserController {
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
      utils.cookieSetter(res, response)
      res.status(200).json(response)
    } catch (error) {
      console.error(error)
      res.status(400).json(error)
    }
  }

  logout = async (req: Request, res: Response) => {
    try {
      const response = await this.userService.logout(req, res)
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
      utils.cookieSetter(res, response)
      res.status(200).json(response)
    } catch (error) {
      console.error(error)
      res.status(401).json(error)
    }
  }

  removeUser = async (req: Request, res: Response) => {
    try {
      await this.userService.removeUser(req, res)
      res.status(200).json({ message: 'success' })
    } catch (error) {
      console.error(error)
      res.status(400).json(error)
    }
  }
}