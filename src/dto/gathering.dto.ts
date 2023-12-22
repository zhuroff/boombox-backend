import { CollectionDocument } from '../models/collection.model'
import { CompilationDocument } from '../models/compilation.model'

export default abstract class GatheringEntity {
  readonly _id: string
  readonly title: string
  readonly dateCreated: Date
  poster?: string
  avatar?: string

  constructor(gathering: CollectionDocument | CompilationDocument) {
    this._id = gathering._id.toString()
    this.title = gathering.title
    this.dateCreated = gathering.dateCreated
    this.poster = gathering.poster
    this.avatar = gathering.avatar
  }
}
