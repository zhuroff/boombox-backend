import { Types } from 'mongoose'

export interface BasicEntity {
  _id: Types.ObjectId
  title: string
}

export interface CompilationCreatePayload {
  entityID: string
  title: string
}

export interface CompilationUpdatePayload {
  entityID: string
  compilationID: string
  isInList: boolean
  order: number
}
