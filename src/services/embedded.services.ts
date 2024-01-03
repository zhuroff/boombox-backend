import { PaginateModel, PaginateOptions, PopulateOptions, Types } from 'mongoose'
import { Embedded } from '../models/embedded.model'
import { Artist } from '../models/artist.model'
import { Genre } from '../models/genre.model'
import { Period } from '../models/period.model'
import { EmbeddedPayload } from '../types/embedded.types'
import { PaginationDTO } from '../dto/pagination.dto'

export default {
  async create(payload: EmbeddedPayload) {
    const newBCAlbum = new Embedded(payload)
    const dbAlbum = await newBCAlbum.save()

    await this.saveAlbumToCategory(Artist, new Types.ObjectId(payload.artist), dbAlbum._id)
    await this.saveAlbumToCategory(Genre, new Types.ObjectId(payload.genre), dbAlbum._id)
    await this.saveAlbumToCategory(Period, new Types.ObjectId(payload.period), dbAlbum._id)

    const createdDoc = await Embedded.findById(dbAlbum._id)
      .populate({ path: 'artist', select: ['title'] })
      .populate({ path: 'genre', select: ['title'] })
      .populate({ path: 'period', select: ['title'] })

    return createdDoc
  },
  async getAllEmbedded({ page, limit, sort }: { page: number; limit: number; sort: { [index: string]: number } }) {
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

    const dbList = await Embedded.paginate({}, options)

    if (dbList) {
      const { totalDocs, totalPages, page } = dbList
      const pagination = new PaginationDTO({ totalDocs, totalPages, page })
      const docs = dbList.docs

      return { docs, pagination }
    }

    throw new Error('Incorrect request options')
  },
  async single(id: string) {
    const response = await Embedded.findById(id)
      .populate({ path: 'artist', select: ['title'] })
      .populate({ path: 'genre', select: ['title'] })
      .populate({ path: 'period', select: ['title'] })

    if (response) {
      return response
    }

    throw new Error('Incorrect request options')
  },
  async remove(_id: string) {
    const entity = await this.single(_id)
    await Embedded.deleteOne({ _id })

    await this.removeAlbumFromCategory(Artist, entity.artist._id, _id)
    await this.removeAlbumFromCategory(Genre, entity.genre._id, _id)
    await this.removeAlbumFromCategory(Period, entity.period._id, _id)

    return { message: 'deletedEmbeddedMessage' }
  },
  async saveAlbumToCategory(...args: [PaginateModel<any>, Types.ObjectId, Types.ObjectId]) {
    const [Model, id, albumID] = args
    const query = { _id: id }
    const update = { $push: { embeddedAlbums: albumID } }
    const options = { upsert: true, new: true, setDefaultsOnInsert: true }

    return await Model.findOneAndUpdate(query, update, options)
  },
  async removeAlbumFromCategory(...args: [PaginateModel<any>, Types.ObjectId, string]) {
    const [Model, id, albumID] = args
    const query = { _id: id }
    const update = { $pull: { embeddedAlbums: albumID } }
    const options = { new: true }

    return await Model.findOneAndUpdate(query, update, options)
  }
}
