import { Document, PaginateResult, Types } from 'mongoose'
import { CloudEntityDTO } from './cloud.types'
import { AlbumDocument } from '../models/album.model'
import { CollectionDocumentAlbum } from '../models/collection.model'
import { ListRequestConfig } from './reqres.types'
import { GatheringUpdateProps } from './common.types'
import AlbumViewFactory from '../views/AlbumViewFactory'

export interface AlbumShape {
  title: string
  folderName: string
  cloudId: string
  cloudURL: string
  artist: string
  genre: string
  period: string
  tracks: Array<Required<CloudEntityDTO>>
}

export interface CoveredAlbum {
  album: AlbumDocument
  cover: string | undefined
}

export interface AlbumRepository {
  fetchAlbumDocs(): Promise<AlbumDocument[]>
  saveNewAlbum(newAlbum: Document, attrs: AlbumAttrs): Promise<Document<AlbumDocument>>
  updateAlbums(albums: AlbumDocument[]): Promise<Array<AlbumDocument | null>>
  getAlbum(id: string | Types.ObjectId): Promise<AlbumDocument>
  deleteAlbum(id: Types.ObjectId | string): Promise<AlbumDocument | null>
  getAlbums(body: ListRequestConfig): Promise<PaginateResult<AlbumDocument | null>>
  getAlbumsRandom(limit: number, filter?: ListRequestConfig['filter']): Promise<Array<AlbumDocument | null>>
  updateCollectionsInAlbum(payload: GatheringUpdateProps): Promise<void>
  getCoveredAlbums(docs: AlbumDocument[]): Promise<CoveredAlbum[]>
  fetchAlbumCover(album: AlbumDocument): Promise<string | undefined>
  cleanAlbumCollections(albums: CollectionDocumentAlbum[], listID: string | Types.ObjectId): Promise<Array<AlbumDocument | null>>
}

export interface AlbumAttrs {
  artist: Types.ObjectId
  genre: Types.ObjectId
  period: Types.ObjectId
  tracks: Types.ObjectId[]
}

export type AlbumItem = ReturnType<typeof AlbumViewFactory.createAlbumItemView>
export type AlbumPage = ReturnType<typeof AlbumViewFactory.createAlbumPageView>
