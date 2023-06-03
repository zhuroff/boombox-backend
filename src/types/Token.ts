import { Types } from 'mongoose'

export type Token = string | null

export type AuthToken = {
  user: Types.ObjectId
  refreshToken: string
}

export type JWToken = {
  login: string
  id: string
}
