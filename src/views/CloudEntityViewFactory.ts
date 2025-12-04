import { PCloudEntity, YandexCloudEntity, UnionCloudsEntity } from '../types/cloud'

class CloudEntityView {
  id: string
  title: string
  cloudURL: string
  created: Date = new Date()
  modified: Date = new Date()
  mimeType?: string
  path?: string
  type?: string

  constructor(
    id: string,
    title: string,
    requestURL: string,
    created: string,
    modified: string,
    mimeType?: string | undefined,
    path?: string,
    type?: string | undefined
  ) {
    this.id = id
    this.title = title
    this.created = new Date(created)
    this.modified = new Date(modified)
    this.cloudURL = new URL(requestURL).origin

    if (mimeType) {
      this.mimeType = mimeType
    }

    if (type) {
      this.type = type
    }

    if (path) {
      this.path = path.replace(/.*\//, '')
    }
  }
}

export default class CloudEntityViewFactory {
  static isPCloudEntity(entity: UnionCloudsEntity): entity is PCloudEntity {
    return 'id' in entity && !('createdTime' in entity)
  }

  static isYandexCloudEntity(entity: UnionCloudsEntity): entity is YandexCloudEntity {
    return 'mime_type' in entity && 'resource_id' in entity
  }

  static create(entity: UnionCloudsEntity, requestURL: string) {
    if (this.isPCloudEntity(entity)) {
      return new CloudEntityView(
        entity.id,
        entity.name,
        requestURL,
        entity.created,
        entity.modified,
        entity.contenttype,
        entity.path
      )
    }

    return new CloudEntityView(
      entity.resource_id,
      entity.name,
      requestURL,
      entity.created,
      entity.modified,
      entity.mime_type,
      entity.path,
      entity.type
    )
  }
}
