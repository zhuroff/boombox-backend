import { CollectionDocument } from '../models/collection.model'
import { CompilationDocument } from '../models/compilation.model'
import EntityBasicView from '../views/BasicEntityView'

export default abstract class GatheringEntity extends EntityBasicView {
  readonly dateCreated: Date
  poster?: string | null
  avatar?: string | null

  constructor(gathering: CollectionDocument | CompilationDocument) {
    super(gathering._id, gathering.title)
    this.dateCreated = gathering.dateCreated
    this.poster = gathering.poster
    this.avatar = gathering.avatar
  }
}
