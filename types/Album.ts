import { Document, Types } from 'mongoose'
import { CloudTrack, TrackModel } from '~/types/Track'

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

type AlbumModel = {
  title: string
  artist: Types.ObjectId
  genre: Types.ObjectId
  period: Types.ObjectId
  dateCreated: Date
  albumCover: number | string
  albumCoverArt: number
  folderid: number
  modified: Date
  description: string
  tracks: Types.ObjectId[] | TrackModel[]
  inCollections: Types.ObjectId[]
  toStay?: boolean
}

// interface IAlbum<T extends Document> extends PaginateModel<T> {}
interface IAlbum extends Document, AlbumModel {}

export {
  CloudFolder,
  CloudAlbumFile,
  CloudAlbumTrack,
  CloudAlbumContent,
  PreparedAlbum,
  AlbumModel,
  IAlbum
}
