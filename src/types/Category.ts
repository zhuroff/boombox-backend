import { Document, Types } from 'mongoose'
import { AlbumResponse } from './album.types'
import { EmbeddedResponse } from './Embedded'

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
  embeddedAlbums: Types.ObjectId[]
}

export type CategoryResponse = Omit<CategoryModel, 'albums' | 'embeddedAlbums'> & {
  _id: string
  albums: AlbumResponse[]
  embeddedAlbums: EmbeddedResponse[]
}

export interface CategoryDocument extends Document, CategoryModel { }
