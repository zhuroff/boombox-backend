import { Types } from 'mongoose'
import { AlbumDocument } from '../models/album.model'
import EntityBasicView from './BasicEntityView'
import TrackView from './TrackView'
import utils from '../utils'

class AlbumItemView extends EntityBasicView {
  folderName: string
  inCollections: EntityBasicView[]
  artist: EntityBasicView
  genre: EntityBasicView
  period: EntityBasicView
  coverURL?: string

  constructor(
    _id: Types.ObjectId,
    title: string,
    cloudURL: string | undefined,
    folderName: string,
    artist: EntityBasicView,
    genre: EntityBasicView,
    period: EntityBasicView,
    inCollections: EntityBasicView[],
    coverURL?: string
  ) {
    super(_id, title, cloudURL)
    this.folderName = folderName
    this.artist = artist
    this.genre = genre
    this.period = period
    this.inCollections = inCollections
    this.coverURL = coverURL
  }
}

class AlbumPageView extends AlbumItemView {
  tracks: TrackView[]

  constructor(album: AlbumItemView, tracks: TrackView[]) {
    super(
      album._id,
      album.title,
      album.cloudURL,
      album.folderName,
      album.artist,
      album.genre,
      album.period,
      album.inCollections,
      album.coverURL
    )
    this.tracks = tracks
  }
}

export default class AlbumViewFactory {
  static createAlbumItemView(album: AlbumDocument, albumCover?: string) {
    return new AlbumItemView(
      album._id,
      album.title,
      album.cloudURL,
      album.folderName,
      utils.createBasicView(album.artist),
      utils.createBasicView(album.genre),
      utils.createBasicView(album.period),
      album.inCollections.map(utils.createBasicView).filter(Boolean),
      albumCover || album.cover
    )
  }

  static createAlbumPageView(album: AlbumDocument, albumCover?: string) {
    const albumItem = this.createAlbumItemView(album, albumCover)
    const tracks = album.tracks.map((track) => new TrackView(track))
    return new AlbumPageView(albumItem, tracks)
  }
}
