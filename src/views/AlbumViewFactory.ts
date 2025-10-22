import { Types } from 'mongoose'
import { AlbumDocument } from '../models/album.model'
import EntityBasicView from './BasicEntityView'
import TrackViewFactory from './TrackViewFactory'

class AlbumItemView extends EntityBasicView {
  path: string
  artist: EntityBasicView
  genre: EntityBasicView
  period: EntityBasicView
  coverURL?: string
  order?: number
  kind = 'album'

  constructor(
    _id: Types.ObjectId,
    title: string,
    cloudURL: string | undefined,
    path: string,
    artist: EntityBasicView,
    genre: EntityBasicView,
    period: EntityBasicView,
    coverURL?: string,
    order?: number
  ) {
    super(_id, title, cloudURL)
    this.path = path
    this.artist = artist
    this.genre = genre
    this.period = period
    this.coverURL = coverURL

    if (order) {
      this.order = order
    }
  }
}

class AlbumPageView extends AlbumItemView {
  inCollections: EntityBasicView[]
  tracks: ReturnType<typeof TrackViewFactory.create>[]

  constructor(
    album: AlbumItemView,
    tracks: ReturnType<typeof TrackViewFactory.create>[],
    inCollections: EntityBasicView[]
  ) {
    super(
      album._id,
      album.title,
      album.cloudURL,
      album.path,
      album.artist,
      album.genre,
      album.period,
      album.coverURL,
      album.order
    )
    this.tracks = tracks
    this.inCollections = inCollections
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
      album.path,
      this.createBasicView(album.artist),
      this.createBasicView(album.genre),
      this.createBasicView(album.period),
      albumCover || album.cover,
      order
    )
  }

  static createAlbumPageView(album: AlbumDocument, albumCover?: string) {
    const albumItem = this.createAlbumItemView(album, albumCover)
    const tracks = album.tracks.map((track) => TrackViewFactory.create(track))
    return new AlbumPageView(
      albumItem,
      tracks,
      album.inCollections?.map(this.createBasicView).filter(Boolean) || []
    )
  }
}
