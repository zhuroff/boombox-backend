import { GoogleCloudEntity, PCloudEntity, YandexCloudEntity, UnionCloudsEntity } from '../types/cloud.types'
import utils from '../utils'

class CloudEntityDTO {
  id: string
  title: string
  cloudURL: string
  created: Date = new Date()
  modified: Date = new Date()
  path: string
  mimeType?: string

  #cluster = process.env['MAIN_CLUSTER']

  constructor(
    id: string,
    title: string,
    requestURL: string,
    created: string,
    modified: string,
    path: string,
    mimeType: string | undefined,
    root?: string,
  ) {
    this.id = id
    this.title = title
    this.created = new Date(created)
    this.modified = new Date(modified)
    this.cloudURL = new URL(requestURL).origin
    this.path = utils.sanitizeURL(path, `${process.env['COLLECTION_ROOT']}/${root || this.#cluster}`)

    if (mimeType) {
      this.mimeType = mimeType
    }
  }
}

export default class CloudEntityFactoryDTO {
  static isPCloudEntity(entity: UnionCloudsEntity): entity is PCloudEntity {
    return 'id' in entity && !('createdTime' in entity)
  }

  static isGoogleCloudEntity(entity: UnionCloudsEntity): entity is GoogleCloudEntity {
    return 'createdTime' in entity
  }

  static isYandexCloudEntity(entity: UnionCloudsEntity): entity is YandexCloudEntity {
    return 'mime_type' in entity && 'resource_id' in entity
  }

  static create(entity: UnionCloudsEntity, requestURL: string, root?: string) {
    if (this.isPCloudEntity(entity)) {
      return new CloudEntityDTO(
        entity.id,
        entity.name,
        requestURL,
        entity.created,
        entity.modified,
        entity.path,
        entity.contenttype,
        root
      )
    }

    if (this.isGoogleCloudEntity(entity)) {
      return new CloudEntityDTO(
        entity.id,
        entity.name,
        requestURL,
        entity.createdTime,
        entity.modifiedTime,
        entity.id,
        entity.mimeType,
        root
      )
    }

    return new CloudEntityDTO(
      entity.resource_id,
      entity.name,
      requestURL,
      entity.created,
      entity.modified,
      entity.path,
      entity.mime_type,
      root
    )
  }
}
