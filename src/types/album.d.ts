import { Request } from 'express'
import { Document, PaginateResult, Types } from 'mongoose'
import { CloudEntity } from './cloud'
import { AlbumDocument } from '../models/album.model'
import { CollectionDocumentAlbum } from '../models/collection.model'
import { ListRequestConfig } from './pagination'
import { GatheringUpdateProps } from './gathering'
import AlbumViewFactory from '../views/AlbumViewFactory'

export interface AlbumShape {
  title: string
  folderName: string
  cloudId: string
  cloudURL: string
  artist: string
  genre: string
  period: string
  path: string
  tracks: Array<Required<CloudEntity>>
}

export interface CoveredAlbum {
  album: AlbumDocument
  cover: string | undefined
}

export interface AlbumAttrs {
  artist: Types.ObjectId
  genre: Types.ObjectId
  period: Types.ObjectId
  tracks: Types.ObjectId[]
}

export interface AlbumRepository {
  fetchAlbumDocs(): Promise<AlbumDocument[]>
  saveNewAlbum(newAlbum: Document, attrs: AlbumAttrs): Promise<Document<AlbumDocument>>
  updateAlbumsClouds(albums: AlbumDocument[]): Promise<Array<AlbumDocument | null>>
  getAlbum(id: string | Types.ObjectId): Promise<AlbumDocument>
  deleteAlbum(id: Types.ObjectId | string): Promise<AlbumDocument | null>
  getAlbums(body: ListRequestConfig): Promise<PaginateResult<AlbumDocument | null>>
  getAlbumsRandom(limit: number, filter?: ListRequestConfig['filter']): Promise<Array<AlbumDocument | null>>
  updateCollectionsInAlbum(payload: GatheringUpdateProps): Promise<void>
  getCoveredAlbums(docs: AlbumDocument[]): Promise<CoveredAlbum[]>
  fetchAlbumCover(album: AlbumDocument): Promise<string | undefined>
  getAlbumContent(req: Request): Promise<Array<string | undefined>>
  cleanAlbumCollections(albums: CollectionDocumentAlbum[], listID: string | Types.ObjectId): Promise<Array<AlbumDocument | null>>
}

export type AlbumItem = ReturnType<typeof AlbumViewFactory.createAlbumItemView>
export type AlbumPage = ReturnType<typeof AlbumViewFactory.createAlbumPageView>
