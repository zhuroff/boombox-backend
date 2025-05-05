import { Types } from 'mongoose'
import { CollectionDocument, CollectionDocumentAlbum } from '../models/collection.model'
import { CompilationDocument, CompilationDocumentTrack } from '../models/compilation.model'
import { AlbumItem } from '../types/album.types'
import TrackView from './TrackView'

class GatheringItemView {
  _id: Types.ObjectId
  dateCreated: Date
  title: string
  poster?: string | null
  avatar?: string | null
  entities?: Types.ObjectId[]

  constructor(
    _id: Types.ObjectId,
    dateCreated: Date,
    title: string,
    poster?: string | null,
    avatar?: string | null,
    entities?: CollectionDocumentAlbum[] | CompilationDocumentTrack[]
  ) {
    this._id = _id
    this.dateCreated = dateCreated
    this.title = title
    this.poster = poster
    this.avatar = avatar

    if (entities) {
      this.entities = entities.map((entity) => (
        'track' in entity ? entity.track._id : entity.album._id
      ))
    }
  }
}

class CollectionPageView extends GatheringItemView {
  albums: AlbumItem[]

  constructor(
    collection: CollectionDocument,
    albums: AlbumItem[]
  ) {
    super(
      collection._id,
      collection.dateCreated,
      collection.title,
      collection.poster,
      collection.avatar
    )

    this.albums = albums
  }
}

class CompilationPageView extends GatheringItemView {
  tracks: TrackView[]

  constructor(
    compilation: CompilationDocument,
    tracks: TrackView[]
  ) {
    super(
      compilation._id,
      compilation.dateCreated,
      compilation.title,
      compilation.poster,
      compilation.avatar
    )

    this.tracks = tracks.map((track) => ({
      ...track,
      title: `${track.artist.title} - ${track.title}`
    }))
  }
}

export default class GatheringViewFactory {
  static createGatheringItemView(
    entity: CollectionDocument | CompilationDocument,
    children: CollectionDocumentAlbum[] | CompilationDocumentTrack[]
  ) {
    return new GatheringItemView(
      entity._id,
      entity.dateCreated,
      entity.title,
      entity.poster,
      entity.avatar,
      children
    )
  }

  static createCollectionPageView(collection: CollectionDocument, albums: AlbumItem[]) {
    return new CollectionPageView(collection, albums)
  }

  static createCompilationPageView(compilation: CompilationDocument, tracks: TrackView[]) {
    return new CompilationPageView(compilation, tracks)
  }
}
