import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { Types } from 'mongoose'

import Users from '../models/userModels'

export interface AuthRequest extends Request {
  user?: {
    id: string
  }
}
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
      }
    }
  }
}

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret)
}

export type AuthRequestHandler = (req: Request, res: Response) => Promise<void>

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      res.status(400).json({ message: 'please fill all the fields' })
      return
    }

    if (!validateEmail(email)) {
      res.status(400).json({ message: 'Please enter a valid email' })
      return
    }

    const user = await Users.findOne({ email })
    if (user) {
      res.status(400).json({ message: 'User already exists' })
      return
    }

    if (password.length < 6) {
      res
        .status(400)
        .json({ message: 'Password must be at least 6 characters long' })
      return
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const newUser = await Users.create({
      name,
      email,
      password: hashedPassword,
    })

    await newUser.save()

    const accessToken = createAccessToken({ id: newUser._id })
    const refreshToken = createRefreshToken({ id: newUser._id })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      path: '/user/refresh_token',
      maxAge: 7 * 24 * 60 * 1000,
    })

    res.json({ accessToken, msg: 'Register Success!' })
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message })
    }
    res.status(500).json({ message: 'An Unknown error occurred' })
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body
    const user = await Users.findOne({ email }).select('+password')

    if (!user) {
      res.status(400).json({ msg: 'Email does not exist' })
      return
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      res.status(400).json({ msg: 'Password does not match' })
      return
    }

    const accessToken = createAccessToken({ id: user._id })

    console.log(accessToken)

    const refreshToken = createRefreshToken({ id: user._id })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      path: '/user/refresh_token',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.json({ msg: 'Login Success', accessToken })
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message })
    }
    res.status(500).json({ message: 'Unknown error' })
  }
}

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie('refreshToken', { path: '/user/refresh_token' })
    res.status(200).json({ msg: 'Logged out!' })
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message })
    }
    res.status(500).json({ message: 'Unknown error' })
  }
}

function validateEmail(email: string): boolean {
  const re =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(email)
}

const createAccessToken = (user: { id: Types.ObjectId }) => {
  return jwt.sign({ id: user.id.toString() }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '11m',
  })
}

const createRefreshToken = (user: { id: Types.ObjectId }) => {
  return jwt.sign(
    { id: user.id.toString() },
    process.env.REFRESH_TOKEN_SECRET!,
    { expiresIn: '7d' }
  )
}
