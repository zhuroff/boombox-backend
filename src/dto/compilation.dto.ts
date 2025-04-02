import { TrackDocument } from '../models/track.model'
import { CompilationDocument } from '../models/compilation.model'
import EntityBasicView from '../views/BasicEntityView'
import GatheringEntity from './gathering.dto'
import TrackView from '../views/TrackView'

export class CompilationItemDTO extends GatheringEntity {
  tracks: EntityBasicView[]

  constructor(compilation: CompilationDocument) {
    super(compilation)
    this.tracks = compilation.tracks.map(({ track }) => {
      const { _id, title, cloudURL } = track as TrackDocument
      return new EntityBasicView(_id, title, cloudURL)
    })
  }
}

export class CompilationPageDTO extends GatheringEntity {
  tracks: Array<TrackView & { order: number }>

  constructor(compilation: CompilationDocument, tracks: TrackView[]) {
    super(compilation)
    this.tracks = tracks.map((track) => ({
      ...track,
      order: compilation.tracks.find((el) => el.track._id.toString() === track._id.toString())?.order || 0
    }))
  }
}
