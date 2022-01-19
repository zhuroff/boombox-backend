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

interface AlbumModel extends Document {
  title: string
  artist: Types.ObjectId
  genre: Types.ObjectId
  period: Types.ObjectId
  dateCreated: Date
  albumCover: number | string
  albumCoverArt: number
  coverID?: number
  toStay?: boolean
  folderid: number
  modified: Date
  description: string
  tracks: [{
    fileid: number
    title: string
    lyrics: string
    duration: number
    listened: number
  }]
}

interface AlbumModelPaginated<T extends Document> extends PaginateModel<T> {}

export {
  CloudAlbum,
  CloudAlbumFolder,
  CloudAlbumFile,
  CloudAlbumTrack,
  CloudAlbumContent,
  AlbumModel,
  AlbumModelPaginated
}
