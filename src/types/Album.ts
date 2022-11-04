import { Document, Types } from 'mongoose'
import { CategoryBasic } from './Category'
import { AlbumItemDTO } from '../dtos/album.dto'
import { PaginationDTO } from '../dtos/pagination.dto'
import { TrackExtPlaylist, TrackReqPayload, TrackResponse } from './Track'

export type AlbumPreform = {
  resource_id: string
  title: string
  artist: string
  genre: string
  period: string
  albumCover: string
  albumCoverArt?: string
  modified: string
  description: string
  folderTracks: TrackReqPayload[]
}

export type AlbumModel = {
  resource_id: string
  title: string
  artist: Types.ObjectId
  genre: Types.ObjectId
  period: Types.ObjectId
  dateCreated: Date
  albumCover: string
  albumCoverArt?: string
  modified: Date
  description: string
  tracks: Types.ObjectId[]
  inCollections: Types.ObjectId[]
}

type ExcludedAlbumFields = 'artist' | 'genre' | 'period' | 'inCollections' | 'tracks'

export type AlbumResponse = Omit<AlbumModel, ExcludedAlbumFields> & {
  _id: string
  artist: CategoryBasic
  genre: CategoryBasic
  period: CategoryBasic
  inCollections: CategoryBasic[]
  tracks: TrackResponse[]
}

export type AlbumPageResponse = {
  docs: AlbumItemDTO[]
  pagination: PaginationDTO
}

export type DiscogsPayload = {
  artist: string
  album: string
  page: number
}

export interface AlbumDocument extends Document, AlbumModel { }
export type AlbumDocumentExt = Omit<AlbumDocument, 'tracks'> & { toStay?: true; tracks: TrackExtPlaylist[] }
