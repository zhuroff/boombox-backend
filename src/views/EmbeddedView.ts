import { Types } from 'mongoose'
import { EmbeddedDocument } from '../models/embedded.model'
import EntityBasicView from './BasicEntityView'

export default class EmbeddedView {
  _id: Types.ObjectId
  title: string
  frame: string
  artist: EntityBasicView
  genre: EntityBasicView
  period: EntityBasicView
  kind = 'embedded'

  constructor(item: EmbeddedDocument) {
    this._id = item._id
    this.title = item.title
    this.frame = item.frame
    this.artist = item.artist
    this.genre = item.genre
    this.period = item.period
  }
}
