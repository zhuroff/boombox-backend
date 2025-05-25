import { TrackDocument } from '../models/track.model'
import { AlbumDocument } from '../models/album.model'
import EntityBasicView from './BasicEntityView'
import CloudEntityViewFactory from './CloudEntityViewFactory'
import Parser from '../utils/Parser'

// class TrackView {
//   _id: string
//   title: string
//   path: string
//   cloudURL: string
//   // cloudId: string
//   duration?: number | null
//   listened?: number | null
//   // period: EntityBasicView
//   // genre: EntityBasicView
//   artist: EntityBasicView
//   inAlbum: AlbumDocument
//   inCompilations?: EntityBasicView[]
//   coverURL?: string
//   order?: number

//   constructor(track: TrackDocument, order?: number) {
//     this._id = track._id.toString()
//     // this.cloudId = track.cloudId
//     this.title = track.title
//     this.path = track.path
//     this.cloudURL = track.cloudURL
//     this.duration = track.duration
//     this.listened = track.listened
//     // this.period = track.period
//     // this.genre = track.genre
//     this.artist = track.artist
//     this.inAlbum = track.inAlbum
//     this.inCompilations = track.inCompilations
//     this.coverURL = track.coverURL

//     if (order) {
//       this.order = order
//     }
//   }
// }

class TrackView {
  _id: string
  title: string
  path: string
  cloudURL: string
  order: number
  artist: Pick<EntityBasicView, 'title'>
  duration?: number | null
  listened?: number | null
  inAlbum?: AlbumDocument
  inCompilations?: EntityBasicView[]

  constructor(
    _id: string,
    title: string,
    path: string,
    cloudURL: string,
    order: number,
    artist: Pick<EntityBasicView, 'title'>,
    duration?: number | null,
    listened?: number | null,
    inAlbum?: AlbumDocument,
    inCompilations?: EntityBasicView[]
  ) {
    this._id = _id
    this.title = title
    this.path = path
    this.cloudURL = cloudURL
    this.order = order
    this.artist = artist
    this.listened = listened
    this.duration = duration

    if (inAlbum) {
      this.inAlbum = inAlbum
    }

    if (inCompilations) {
      this.inCompilations = inCompilations
    }
  }
}

export default class TrackViewFactory {
  static isTrackDocument(track: TrackDocument | ReturnType<typeof CloudEntityViewFactory.create>): track is TrackDocument {
    return 'inAlbum' in track
  }

  static isCloudEntity(track: TrackDocument | ReturnType<typeof CloudEntityViewFactory.create>): track is ReturnType<typeof CloudEntityViewFactory.create> {
    return 'mimeType' in track
  }

  static create(track: TrackDocument | ReturnType<typeof CloudEntityViewFactory.create>, order?: number) {
    if (this.isTrackDocument(track)) {
      return new TrackView(
        track._id.toString(),
        track.title,
        track.path,
        track.cloudURL,
        order || Number(track.fileName.match(/^\d+/)?.[0]) || order || 0,
        track.artist,
        track.listened,
        track.duration,
        track.inAlbum
      )
    }

    return new TrackView(
      track.id,
      Parser.parseTrackTitle(track.title),
      String(track.path),
      track.cloudURL,
      order || 0,
      { title: 'Various Artists' }
    )
  }
}
