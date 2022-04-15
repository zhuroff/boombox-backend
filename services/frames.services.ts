import { Frame } from '~/models/frame.model'
import { Artist } from '~/models/artist.model'
import { Genre } from '~/models/genre.model'
import { Period } from '~/models/period.model'
import { PaginateModel, Types } from 'mongoose'
import { ApiError } from '~/exceptions/api-errors'
import { ListConfig, PaginationOptions, Populate } from '~/types/ReqRes'
import { PaginationDTO } from '~/dtos/pagination.dto'
import { CategoryKeys } from '~/types/Category'

class FramesServices {
  async create(frame: any) {
    const newBCAlbum = new Frame(frame)
    const dbAlbum = await newBCAlbum.save()

    await this.saveAlbumToCategory(Artist, frame.artist, dbAlbum._id)
    await this.saveAlbumToCategory(Genre, frame.genre, dbAlbum._id)
    await this.saveAlbumToCategory(Period, frame.period, dbAlbum._id)

    const createdFrame = await Frame.findById(dbAlbum._id)
      .populate({ path: 'artist', select: ['title'] })
      .populate({ path: 'genre', select: ['title'] })
      .populate({ path: 'period', select: ['title'] })

    return createdFrame
  }

  async list({ page, limit, sort }: ListConfig) {
    const populate: Populate[] = [
      { path: 'artist', select: ['title'] },
      { path: 'genre', select: ['title'] },
      { path: 'period', select: ['title'] },
      { path: 'inCollections', select: ['title'] }
    ]

    const options: PaginationOptions = {
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

    const dbList = await Frame.paginate({}, options)
    
    if (dbList) {
      const { totalDocs, totalPages, page } = dbList
      const pagination = new PaginationDTO({ totalDocs, totalPages, page })
      const docs = dbList.docs

      return { docs, pagination }
    }

    throw ApiError.BadRequest('Incorrect request options')
  }

  async single(id: string) {
    const response = await Frame.findById(id)
      .populate({ path: 'artist', select: ['title'] })
      .populate({ path: 'genre', select: ['title'] })
      .populate({ path: 'period', select: ['title'] })

    if (response) {
      return response
    }

    throw ApiError.BadRequest('Incorrect request options')
  }

  async remove(_id: string, { artist, genre, period }: CategoryKeys) {
    await Frame.deleteOne({ _id })

    await this.removeAlbumFromCategory(Artist, artist, _id)
    await this.removeAlbumFromCategory(Genre, genre, _id)
    await this.removeAlbumFromCategory(Period, period, _id)

    return { message: 'Album successfully deleted' }
  }

  async saveAlbumToCategory(...args: [PaginateModel<any>, Types.ObjectId, Types.ObjectId]) {
    const [Model, id, albumID] = args
    const query = { _id: id }
    const update = { $push: { framesAlbums: albumID } }
    const options = { upsert: true, new: true, setDefaultsOnInsert: true }

    return await Model.findOneAndUpdate(query, update, options)
  }

  async removeAlbumFromCategory(...args: [PaginateModel<any>, Types.ObjectId, string]) {
    const [Model, id, albumID] = args
    const query = { _id: id }
    const update = { $pull: { framesAlbums: albumID } }
    const options = { new: true }

    return await Model.findOneAndUpdate(query, update, options)
  }
}

export default new FramesServices()
