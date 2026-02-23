import { Types } from 'mongoose'
import { AlbumDocument } from '../models/album.model'
import EntityBasicView from './BasicEntityView'
import TrackViewFactory from './TrackViewFactory'

class AlbumItemView extends EntityBasicView {
  path: string
  artists: EntityBasicView[]
  genre: EntityBasicView
  period: EntityBasicView
  coverURL?: string
  order?: number
  post?: string
  kind = 'album'

  constructor(
    _id: Types.ObjectId,
    title: string,
    cloudURL: string | undefined,
    path: string,
    artists: EntityBasicView[],
    genre: EntityBasicView,
    period: EntityBasicView,
    coverURL?: string,
    order?: number,
    post?: string
  ) {
    super(_id, title, cloudURL)
    this.path = path
    this.artists = artists
    this.genre = genre
    this.period = period
    this.coverURL = coverURL

    if (order) {
      this.order = order
    }

    if (post) {
      this.post = post
    }
  }
}

class AlbumPageView extends AlbumItemView {
  inCollections: EntityBasicView[]
  tracks: ReturnType<typeof TrackViewFactory.create>[]
  note: string

  constructor(
    album: AlbumItemView,
    tracks: ReturnType<typeof TrackViewFactory.create>[],
    inCollections: EntityBasicView[],
    note?: string | null
  ) {
    super(
      album._id,
      album.title,
      album.cloudURL,
      album.path,
      album.artists,
      album.genre,
      album.period,
      album.coverURL,
      album.order
    )
    this.tracks = tracks
    this.inCollections = inCollections
    this.note = note || ''
  }
}

export default class AlbumViewFactory {
  static createBasicView(entity: { _id: Types.ObjectId; title: string; cloudURL?: string }) {
    return new EntityBasicView(entity._id, entity.title, entity.cloudURL)
  }

  static createAlbumItemView(album: AlbumDocument, albumCover?: string, order?: number, post?: string) {
    const artistRefs = (album as { artists?: { _id: Types.ObjectId; title?: string }[]; artist?: { _id: Types.ObjectId; title?: string } }).artists ?? (album as { artist?: { _id: Types.ObjectId; title?: string } }).artist
    const artists = Array.isArray(artistRefs) ? artistRefs : artistRefs ? [artistRefs] : []
    return new AlbumItemView(
      album._id,
      album.title,
      album.cloudURL,
      album.path,
      artists.map((a) => this.createBasicView({ _id: a._id, title: a.title ?? '', cloudURL: undefined })),
      this.createBasicView(album.genre),
      this.createBasicView(album.period),
      albumCover || album.cover,
      order,
      post
    )
  }

  static createAlbumPageView(album: AlbumDocument, albumCover?: string) {
    const albumItem = this.createAlbumItemView(album, albumCover)
    const tracks = album.tracks.map((track) => TrackViewFactory.create(track))
    const note = album.note

    return new AlbumPageView(
      albumItem,
      tracks,
      album.inCollections?.map(this.createBasicView).filter(Boolean) || [],
      note
    )
  }
}
