import { Types } from 'mongoose'
import { AlbumDocument } from '../models/album.model'
import EntityBasicView from './BasicEntityView'
import TrackView from './TrackView'

class AlbumItemView extends EntityBasicView {
  folderName: string
  inCollections: EntityBasicView[]
  artist: EntityBasicView
  genre: EntityBasicView
  period: EntityBasicView
  coverURL?: string
  order?: number

  constructor(
    _id: Types.ObjectId,
    title: string,
    cloudURL: string | undefined,
    folderName: string,
    artist: EntityBasicView,
    genre: EntityBasicView,
    period: EntityBasicView,
    inCollections: EntityBasicView[],
    coverURL?: string,
    order?: number
  ) {
    super(_id, title, cloudURL)
    this.folderName = folderName
    this.artist = artist
    this.genre = genre
    this.period = period
    this.inCollections = inCollections
    this.coverURL = coverURL

    if (order) {
      this.order = order
    }
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
      album.coverURL,
      album.order
    )
    this.tracks = tracks
  }
}

export default class AlbumViewFactory {
  static createBasicView(entity: { _id: Types.ObjectId; title: string; cloudURL?: string }) {
    return new EntityBasicView(entity._id, entity.title, entity.cloudURL)
  }

  static createAlbumItemView(album: AlbumDocument, albumCover?: string, order?: number) {
    return new AlbumItemView(
      album._id,
      album.title,
      album.cloudURL,
      album.folderName,
      this.createBasicView(album.artist),
      this.createBasicView(album.genre),
      this.createBasicView(album.period),
      album.inCollections.map(this.createBasicView).filter(Boolean),
      albumCover || album.cover,
      order
    )
  }

  static createAlbumPageView(album: AlbumDocument, albumCover?: string) {
    const albumItem = this.createAlbumItemView(album, albumCover)
    const tracks = album.tracks.map((track) => new TrackView(track))
    return new AlbumPageView(albumItem, tracks)
  }
}
