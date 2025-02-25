import { GoogleCloudEntity, PCloudEntity, UnionCloudsEntity, YandexCloudEntity } from '../types/cloud.types'
import utils from '../utils'

class CloudEntityDTO {
  id: string
  title: string
  cloudURL: string
  created: Date = new Date()
  modified: Date = new Date()
  mimeType?: string
  path?: string

  constructor(
    id: string,
    root: string,
    title: string,
    requestURL: string,
    created: string,
    modified: string,
    mimeType: string | undefined,
    path?: string
  ) {
    this.id = id
    this.title = title
    this.created = new Date(created)
    this.modified = new Date(modified)
    this.cloudURL = new URL(requestURL).origin

    if (path) {
      this.path = utils.sanitizeURL(path, `${process.env['COLLECTION_ROOT']}/${root}`)
    }

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

  static create(entity: UnionCloudsEntity, requestURL: string, root = 'Collection/') {
    if (this.isPCloudEntity(entity)) {
      return new CloudEntityDTO(
        entity.id,
        root,
        entity.name,
        requestURL,
        entity.created,
        entity.modified,
        entity.contenttype,
        entity.path
      )
    }

    if (this.isGoogleCloudEntity(entity)) {
      return new CloudEntityDTO(
        entity.id,
        root,
        entity.name,
        requestURL,
        entity.createdTime,
        entity.modifiedTime,
        entity.mimeType
      )
    }

    return new CloudEntityDTO(
      entity.resource_id,
      root,
      entity.name,
      requestURL,
      entity.created,
      entity.modified,
      entity.mime_type,
      entity.path
    )
  }
}
