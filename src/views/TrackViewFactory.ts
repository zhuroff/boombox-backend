import { TrackDocument } from '../models/track.model'
import { AlbumDocument } from '../models/album.model'
import EntityBasicView from './BasicEntityView'
import CloudEntityViewFactory from './CloudEntityViewFactory'
import Parser from '../utils/Parser'

type TrackMetadata = {
  artist: Pick<EntityBasicView, 'title'>
  period: Pick<EntityBasicView, 'title'>
  genre: Pick<EntityBasicView, 'title'>
  inAlbum: Pick<AlbumDocument, 'title'>
  order: number
}

class TrackView {
  _id: string
  title: string
  path: string
  cloudURL: string
  order: number
  artist: Pick<EntityBasicView, 'title'>
  period: Pick<EntityBasicView, 'title'>
  genre: Pick<EntityBasicView, 'title'>
  inAlbum: Pick<AlbumDocument, 'title'>
  duration?: number | null
  inCompilations?: EntityBasicView[]

  constructor(
    _id: string,
    title: string,
    path: string,
    cloudURL: string,
    order: number,
    artist: Pick<EntityBasicView, 'title'>,
    period: Pick<EntityBasicView, 'title'>,
    genre: Pick<EntityBasicView, 'title'>,
    inAlbum: Pick<AlbumDocument, 'title'>,
    duration?: number | null,
    inCompilations?: EntityBasicView[]
  ) {
    this._id = _id
    this.title = title
    this.path = path
    this.cloudURL = cloudURL
    this.order = order
    this.artist = artist
    this.period = period
    this.genre = genre
    this.inAlbum = inAlbum
    this.duration = duration

    if (inCompilations) {
      this.inCompilations = inCompilations
    }
  }
}

export default class TrackViewFactory {
  static isTrackDocument(track: TrackDocument | ReturnType<typeof CloudEntityViewFactory.create>): track is TrackDocument {
    return '_id' in track
  }
  
  static isCloudEntity(track: TrackDocument | ReturnType<typeof CloudEntityViewFactory.create>): track is ReturnType<typeof CloudEntityViewFactory.create> {
    return 'mimeType' in track
  }

  static create(
    track: TrackDocument | ReturnType<typeof CloudEntityViewFactory.create>,
    metadata: TrackMetadata = {
      artist: { title: 'Various Artists' },
      period: { title: 'N/A' },
      genre: { title: 'N/A' },
      inAlbum: { title: 'N/A' },
      order: 0
    }
  ) {
    if (this.isTrackDocument(track)) {
      return new TrackView(
        track._id.toString(),
        track.title,
        track.path,
        track.cloudURL,
        track.order || Number(track.fileName.match(/^\d+/)?.[0]) || 0,
        track.artist,
        track.period,
        track.genre,
        track.inAlbum,
        track.duration
      )
    }

    return new TrackView(
      track.id,
      Parser.parseTrackTitle(track.title),
      String(track.path),
      track.cloudURL,
      metadata.order,
      metadata.artist,
      metadata.period,
      metadata.genre,
      metadata.inAlbum
    )
  }
}
