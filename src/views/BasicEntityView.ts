import { Types } from 'mongoose'

export default class EntityBasicView {
  readonly _id: Types.ObjectId
  readonly title: string
  readonly cloudURL?: string

  constructor(
    id: Types.ObjectId,
    title: string,
    cloudURL?: string,
  ) {
    this._id = id
    this.title = title

    if (cloudURL) {
      this.cloudURL = cloudURL
    }
  }
}
