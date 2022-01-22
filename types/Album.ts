import { Document, Types, PaginateModel } from 'mongoose'

interface CloudAlbum {
  path: string
  name: string
  created: string
  ismine: boolean
  thumb: boolean
  modified: string
  comments: number
  id: string
  isshared: boolean
  icon: string
  isfolder: boolean
  parentfolderid: number
  folderid: number
}

interface CloudAlbumFolder {
  isfolder: true
  name: string
  folderid: number
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

type CloudAlbumContent = CloudAlbumFolder | CloudAlbumFile | CloudAlbumTrack

interface AlbumTracksModel {
  fileid: number
  title: string
  lyrics: string
  duration: number
  listened: number
  link?: string
}

interface AlbumModel {
  _id?: Types.ObjectId
  title: string
  artistTitle?: string
  genreTitle?: string
  periodYear?: string
  albumCover: number | string
  albumCoverArt: number
  coverID?: number
  toStay?: boolean
  folderid: number
  modified: Date | string
  description: string
  tracks: AlbumTracksModel[]
}

interface AlbumModelDocument extends AlbumModel, Document {
  dateCreated: Date
  artist: Types.ObjectId
  genre: Types.ObjectId
  period: Types.ObjectId
  _id: Types.ObjectId
  _doc: AlbumModel
}

interface AlbumModelPaginated<T extends Document> extends PaginateModel<T> {}

export {
  CloudAlbum,
  CloudAlbumFolder,
  CloudAlbumFile,
  CloudAlbumTrack,
  CloudAlbumContent,
  AlbumModel,
  AlbumModelDocument,
  AlbumTracksModel,
  AlbumModelPaginated
}
