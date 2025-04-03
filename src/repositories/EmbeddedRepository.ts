import { PaginateOptions, PopulateOptions, Types } from 'mongoose'
import { Embedded } from '../models/embedded.model'
import { EmbeddedPayload, EmbeddedRepository } from '../types/embedded.types'
import { ListRequestConfig } from '../types/pagination.types'

export default class EmbeddedRepositoryContract implements EmbeddedRepository {
  async createEmbedded(payload: EmbeddedPayload) {
    const newEmbedded = new Embedded(payload)
    return await newEmbedded.save()
  }

  async getPopulatedEmbedded(id: string | Types.ObjectId) {
    return await Embedded.findById(id)
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
      { path: 'inCollections', select: ['title'] }
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
