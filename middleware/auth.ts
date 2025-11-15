import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

export interface AuthRequest extends Request {
  user?: {
    id: string
  }
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    res.status(401).json({ msg: 'No token, authorization denied' })
    return
  }

  try {
    const secret = process.env.ACCESS_TOKEN_SECRET
    if (!secret) {
      throw new Error(
        'ACCESS_TOKEN_SECRET is not defined in enviroment variable'
      )
    }

    const decoded = jwt.verify(token, secret) as { id: string }
    req.user = { id: decoded.id }
    next()
  } catch (err) {
    res.status(401).json({ msg: 'Invalid Authentication', err })
  }
}
