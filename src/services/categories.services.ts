import { Request } from 'express'
import { PaginateModel, PaginateOptions, Types } from 'mongoose'
import { CategoryResponse, CategoryDocument } from '../types/category.types'
import { CategoryItemDTO, CategoryPageDTO } from '../dtos/category.dto'
import { PaginationDTO } from '../dtos/pagination.dto'
import { Embedded } from '../models/embedded.model'
import { AlbumResponse } from '../types/album.types'
import { EmbeddedResponse } from '../types/Embedded'
import { AlbumItemDTO } from '../dtos/album.dto'
import { Cloud } from '..'
import utils from '../utils'

class CategoriesServices {
  async getCategoriesList<T>(Model: PaginateModel<T>, req: Request) {
    const populates = [
      { path: 'albums', select: ['_id'] },
      { path: 'embeddedAlbums', select: ['_id'], model: Embedded }
    ]

    const options: PaginateOptions = {
      page: req.body.page,
      limit: req.body.limit,
      sort: req.body.sort,
      populate: populates,
      lean: true,
      select: {
        title: true,
        avatar: true
      }
    }

    const dbList = await Model.paginate({}, options)

    if (dbList) {
      const { totalDocs, totalPages, page } = dbList
      const pagination = new PaginationDTO({ totalDocs, totalPages, page })

      const dbDocs = dbList.docs as unknown as CategoryDocument[]
      const docs = dbDocs.map((category) => new CategoryItemDTO(category))

      return { docs, pagination }
    }

    throw new Error()
  }

  async single<T>(Model: PaginateModel<T>, req: Request) {
    const categorySingle: CategoryResponse = await Model.findById(req.params['id'])
      .populate<AlbumResponse[]>({
        path: 'albums',
        select: ['title', 'folderName'],
        populate: [
          { path: 'artist', select: ['title', '_id'] },
          { path: 'genre', select: ['title', '_id'] },
          { path: 'period', select: ['title', '_id'] }
        ]
      })
      .populate<EmbeddedResponse[]>({
        path: 'embeddedAlbums',
        select: ['title', 'frame'],
        populate: [
          { path: 'artist', select: ['title', '_id'] },
          { path: 'genre', select: ['title', '_id'] },
          { path: 'period', select: ['title', '_id'] }
        ]
      })
      .lean()

    const coveredAlbumsRes = categorySingle.albums.map(async (album) => {
      const albumCover = await Cloud.getFile(
        `${process.env['COLLECTION_ROOT']}/Collection/${utils.sanitizeURL(album.folderName)}/cover.webp`
      )
      return new AlbumItemDTO(album, albumCover || '')
    })

    const coveredAlbums = await Promise.all(coveredAlbumsRes)

    return new CategoryPageDTO(categorySingle, coveredAlbums)
  }

  async create(Model: PaginateModel<CategoryDocument>, title: string, _id?: Types.ObjectId) {
    const query = { title }
    const update = { $push: { albums: _id } }
    const options = { upsert: true, new: true, setDefaultsOnInsert: true }

    return await Model.findOneAndUpdate(query, update, options)
  }

  async remove<T>(Model: PaginateModel<T>, _id: string) {
    await Model.deleteOne({ _id })
    return { message: 'Category successfully deleted' }
  }

  async cleanAlbums(Model: PaginateModel<CategoryDocument>, categoryId: Types.ObjectId, albumId: Types.ObjectId | string) {
    const query = { _id: categoryId }
    const update = { $pull: { albums: albumId } }
    await Model.findOneAndUpdate(query, update)
  }
}

export default new CategoriesServices()
