import { PaginateOptions, PopulateOptions, Types } from 'mongoose'
import { Embedded, EmbeddedDocument } from '../models/embedded.model'
import { EmbeddedPayload, EmbeddedRepository } from '../types/embedded'
import { ListRequestConfig } from '../types/pagination'

export default class EmbeddedRepositoryContract implements EmbeddedRepository {
  async createEmbedded(payload: EmbeddedPayload) {
    const newEmbedded = new Embedded(payload)
    return await newEmbedded.save()
  }

  async getPopulatedEmbedded(id: string | Types.ObjectId) {
    return await(
      id === 'random'
        ? Embedded.findOne<EmbeddedDocument>().skip(Math.floor(Math.random() * await Embedded.countDocuments()))
        : Embedded.findById(id)
    )
      .populate({ path: 'artist', select: ['title'] })
      .populate({ path: 'genre', select: ['title'] })
      .populate({ path: 'period', select: ['title'] })
  }

  async getPopulatedEmbeddedList(payload: ListRequestConfig) {
    const { page, limit, sort } = payload

    const populate: PopulateOptions[] = [
      { path: 'artist', select: ['title'] },
      { path: 'genre', select: ['title'] },
      { path: 'period', select: ['title'] },
    ]

    const options: PaginateOptions = {
      page,
      limit,
      sort,
      populate,
      lean: true,
      select: {
        title: true,
        frame: true
      }
    }

    return await Embedded.paginate({}, options)
  }

  async removeEmbedded(_id: string | Types.ObjectId) {
    await Embedded.deleteOne({ _id })
  }
}
