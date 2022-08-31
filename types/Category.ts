import 'module-alias/register'
import { Document, Types } from 'mongoose'
import { AlbumResponse } from './Album'
import { FrameResponse } from './Frame'

export type CategoryBasic = {
  _id: Types.ObjectId
  title: string
}

export type CategoryModel = {
  title: string
  dateCreated: Date
  poster: string
  avatar: string
  albums: Types.ObjectId[]
  framesAlbums: Types.ObjectId[]
}

export type CategoryResponse = Omit<CategoryModel, 'albums' | 'framesAlbums'> & {
  _id: string
  albums: AlbumResponse[]
  framesAlbums: FrameResponse[]
}

export interface CategoryDocument extends Document, CategoryModel { }
