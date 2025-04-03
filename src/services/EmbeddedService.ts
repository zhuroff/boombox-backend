import { Types } from 'mongoose'
import { Artist } from '../models/artist.model'
import { Genre } from '../models/genre.model'
import { Period } from '../models/period.model'
import { CategoryRepository } from '../types/common.types'
import { EmbeddedPayload, EmbeddedRepository } from '../types/embedded.types'
import { ListRequestConfig } from '../types/reqres.types'
import PaginationViewFactory from '../views/PaginationViewFactory'

export default class EmbeddedService {
  constructor(
    private embeddedRepository: EmbeddedRepository,
    private categoryRepository: CategoryRepository
  ) {}

  async createEmbedded(payload: EmbeddedPayload) {
    const createdEmbedded = await this.embeddedRepository.createEmbedded(payload)

    const categoryUpdateMap = new Map([
      [Artist, { _id: new Types.ObjectId(payload.artist) }],
      [Genre, { _id: new Types.ObjectId(payload.genre) }],
      [Period, { _id: new Types.ObjectId(payload.period) }]
    ])

    await Promise.all(categoryUpdateMap.entries()
      .map(async ([Model, filter]) => (
        await this.categoryRepository.updateCategory(
          Model,
          filter,
          { $push: { embeddedAlbums: createdEmbedded._id } },
          { upsert: true, setDefaultsOnInsert: true }
        )
      ))
    )

    return await this.embeddedRepository.getPopulatedEmbedded(createdEmbedded._id)
  }

  async getPopulatedEmbedded(id: string) {
    const embedded = await this.embeddedRepository.getPopulatedEmbedded(id)

    if (!embedded) {
      throw new Error('Incorrect request options')
    }

    return embedded
  }

  async getPopulatedEmbeddedList(payload: ListRequestConfig) {
    const response = await this.embeddedRepository.getPopulatedEmbeddedList(payload)

    if (!response.docs.every((doc) => !!doc)) {
      throw new Error('Incorrect request options')
    }

    const { totalDocs, totalPages, page } = response
    const pagination = PaginationViewFactory.create({ totalDocs, totalPages, page })
    const docs = response.docs

    return { docs, pagination }
  }

  async removeEmbedded(id: string) {
    const deletedEmbedded = await this.embeddedRepository.getPopulatedEmbedded(id)

    if (!deletedEmbedded) {
      throw new Error('Incorrect request options')
    }

    await this.embeddedRepository.removeEmbedded(id)

    const categoryUpdateMap = new Map([
      [Artist, { _id: new Types.ObjectId(deletedEmbedded.artist._id) }],
      [Genre, { _id: new Types.ObjectId(deletedEmbedded.genre._id) }],
      [Period, { _id: new Types.ObjectId(deletedEmbedded.period._id) }]
    ])

    await Promise.all(categoryUpdateMap.entries()
      .map(async ([Model, filter]) => (
        await this.categoryRepository.updateCategory(
          Model,
          filter,
          { $pull: { embeddedAlbums: deletedEmbedded._id } }
        )
      ))
    )

    return { message: 'deletedEmbeddedMessage' }
  }
}
