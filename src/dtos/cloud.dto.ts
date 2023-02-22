import utils from '../utils'
import { UnionCloudsEntity } from '../types/Cloud'

export class CloudEntityDTO {
  id: string = ''
  path: string = ''
  title: string = ''
  created: Date = new Date()
  modified: Date = new Date()
  mimeType?: string

  #idSetter(item: UnionCloudsEntity) {
    if ('id' in item) return item.id
    return item.resource_id
  }

  #mimeTypeSetter(item: UnionCloudsEntity) {
    if ('contenttype' in item) {
      return item.contenttype
    }

    if ('mime_type' in item) {
      return item.mime_type
    }

    return
  }

  constructor(item: UnionCloudsEntity) {
    this.id = this.#idSetter(item)
    this.path = utils.sanitizeURL(item.path, `${process.env['COLLECTION_ROOT']}/`)
    this.title = item.name
    this.created = new Date(item.created)
    this.modified = new Date(item.modified)

    const mimeType = this.#mimeTypeSetter(item)
    if (mimeType) this.mimeType = mimeType
  }
}
