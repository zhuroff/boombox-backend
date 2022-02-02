import { Document, PaginateModel, Types } from 'mongoose'
import { CloudTrack } from '~/types/Track'

interface CloudFolder {
  isfolder: true
  name: string
  folderid: number
  modified: string
}

interface CloudAlbumFile {
  isfolder: false
  name: string
  contenttype: string
  fileid: number
}

interface CloudAlbumTrack extends CloudAlbumFile {
  title: string
}

type CloudAlbumContent = CloudFolder | CloudAlbumFile | CloudAlbumTrack

interface PreparedAlbum {
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

interface AlbumModel extends Document {
  title: string
  artist: Types.ObjectId
  genre: Types.ObjectId
  period: Types.ObjectId
  dateCreated: Date
  albumCover: number
  albumCoverArt: number
  folderid: number
  modified: Date
  description: string
  tracks: Types.ObjectId[]
  inCollections?: Types.ObjectId[]
  toStay?: boolean
}

interface IAlbum<T extends Document> extends PaginateModel<T> {}

interface IAlbumResponse {
  docs: AlbumModel[]

  pagination: {
    totalDocs: number
    totalPages: number
    page: number
  }
}

export {
  CloudFolder,
  CloudAlbumFile,
  CloudAlbumTrack,
  CloudAlbumContent,
  PreparedAlbum,
  AlbumModel,
  IAlbum,
  IAlbumResponse
}
