import { Request, Response, NextFunction } from 'express'

export const noIndexMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex')
  next()
}

