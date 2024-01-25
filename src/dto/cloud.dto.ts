import { UnionCloudsEntity } from '../types/cloud.types'
import utils from '../utils'

export class CloudEntityDTO {
  id: string
  path: string
  title: string
  cloudURL: string
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

  constructor(item: UnionCloudsEntity, cloudURL: string, root = 'Collection/') {
    this.id = this.#idSetter(item)
    this.path = utils.sanitizeURL(item.path, `${process.env['COLLECTION_ROOT']}/${root}`)
    this.title = item.name
    this.cloudURL = new URL(cloudURL).origin
    this.created = new Date(item.created)
    this.modified = new Date(item.modified)

    const mimeType = this.#mimeTypeSetter(item)
    if (mimeType) this.mimeType = mimeType
  }
}
