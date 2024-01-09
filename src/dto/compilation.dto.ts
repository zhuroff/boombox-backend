import { TrackDocument } from '../models/track.model'
import { CompilationDocument } from '../models/compilation.model'
import { EntityBasicDTO } from './basic.dto'
import { TrackDTO } from './track.dto'
import GatheringEntity from './gathering.dto'

export class CompilationItemDTO extends GatheringEntity {
  tracks: EntityBasicDTO[]

  constructor(compilation: CompilationDocument) {
    super(compilation)
    this.tracks = compilation.tracks.map(({ track }) => {
      const { _id, title, cloudURL } = track as TrackDocument
      return new EntityBasicDTO(_id, title, cloudURL)
    })
  }
}

export class CompilationPageDTO extends GatheringEntity {
  tracks: Array<TrackDTO & { order: number }>

  constructor(compilation: CompilationDocument, tracks: TrackDTO[]) {
    super(compilation)
    this.tracks = tracks.map((track) => ({
      ...track,
      order: compilation.tracks.find((el) => el.track._id.toString() === track._id.toString())?.order || 0
    }))
  }
}
