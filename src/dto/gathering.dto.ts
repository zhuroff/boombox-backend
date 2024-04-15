import { CollectionDocument } from '../models/collection.model'
import { CompilationDocument } from '../models/compilation.model'
import { EntityBasicDTO } from './basic.dto'

export default abstract class GatheringEntity extends EntityBasicDTO {
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
