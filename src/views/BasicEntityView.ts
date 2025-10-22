import { Types } from 'mongoose'

export default class EntityBasicView {
  readonly _id: Types.ObjectId
  readonly title: string
  readonly cloudURL?: string
  readonly cloudId?: string

  constructor(
    id: Types.ObjectId,
    title: string,
    cloudURL?: string,
    cloudId?: string
  ) {
    this._id = id
    this.title = title
    
    if (cloudId) {
      this.cloudId = cloudId
    }

    if (cloudURL) {
      this.cloudURL = cloudURL
    }
  }
}
