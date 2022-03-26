import { Document, Types } from 'mongoose'
import { CloudTrack, TrackModel, TrackResponse } from './Track'
import { CategoryBasic } from './Category'
import { Pagination } from './ReqRes'

type CloudFolder = {
  isfolder: true
  name: string
  folderid: number
  modified: string
}

type CloudAlbumFile = {
  isfolder: false
  name: string
  contenttype: string
  fileid: number
}

type CloudAlbumTrack = CloudAlbumFile & {
  title: string
}

type CloudAlbumContent = CloudFolder | CloudAlbumFile | CloudAlbumTrack

type PreparedAlbum = {
  title: string
  artist: string
  genre: string
  period: string
  albumCover: number | string
  albumCoverArt: number
  coverID?: number
  toStay?: boolean
  folderid: number
  modified: Date | string
  description: string
  folderTracks: CloudTrack[]
}

type AlbumCommon = {
  title: string
  albumCoverArt: number
  folderid: number
  description: string
  inCollections: Types.ObjectId[]
}

type AlbumModel = AlbumCommon & {
  artist: Types.ObjectId
  genre: Types.ObjectId
  period: Types.ObjectId
  dateCreated: Date
  albumCover: number
  modified: Date
  tracks: Types.ObjectId[] | TrackModel[]
  toStay?: boolean
}

type AlbumResponse = AlbumCommon & {
  _id: Types.ObjectId
  artist: CategoryBasic
  genre: CategoryBasic
  period: CategoryBasic
  albumCover: string
  tracks: TrackResponse[]
}

type AlbumPageResponse = {
  docs: AlbumModel[]
  pagination: Pagination
}

interface IAlbum extends Document, AlbumModel {}

export {
  CloudFolder,
  CloudAlbumFile,
  CloudAlbumTrack,
  CloudAlbumContent,
  PreparedAlbum,
  AlbumResponse,
  AlbumPageResponse,
  AlbumModel,
  IAlbum
}
