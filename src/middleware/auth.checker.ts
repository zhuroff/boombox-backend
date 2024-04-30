import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export const authChecker = (req: Request, res: Response, next: () => void) => {
  if (req.method === 'OPTIONS') {
    return next()
  }

  try {
    const token = String(req.headers.authorization).split(' ')[1]

    if (!token) {
      return res.status(403).json({ message: 'User is not authorized' })
    }

    const decodedToken = jwt.verify(token, String(process.env['JWT_SECRET_TOKEN']))
    req.user = decodedToken
    return next()
  } catch (error) {
    console.info(error)
    return res.status(403).json({ message: 'User is not authorized' })
  }
}
