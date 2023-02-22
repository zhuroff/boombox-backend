import { Request } from 'express'
import { PaginateModel, Types } from 'mongoose'
import { CategoryResponse, CategoryDocument } from '../types/Category'
import { PaginationOptions } from '../types/ReqRes'
import { CategoryItemDTO, CategoryPageDTO } from '../dtos/category.dto'
import { PaginationDTO } from '../dtos/pagination.dto'
import { Frame } from '../models/frame.model'
import { AlbumResponse } from '../types/Album'
import { CloudLib } from '../lib/cloud.lib'
import { CloudFile } from '../types/Cloud'
import { FrameResponse } from '../types/Frame'
import { AlbumItemDTO } from '../dtos/album.dto'

class CategoriesServices {
  async list<T>(Model: PaginateModel<T>, req: Request) {
    const populates = [
      { path: 'albums', select: ['_id'] },
      { path: 'framesAlbums', select: ['_id'], model: Frame }
    ]

    const options: PaginationOptions = {
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
        select: ['title', 'albumCover'],
        populate: [
          { path: 'artist', select: ['title', '_id'] },
          { path: 'genre', select: ['title', '_id'] },
          { path: 'period', select: ['title', '_id'] }
        ]
      })
      .populate<FrameResponse[]>({
        path: 'framesAlbums',
        select: ['title', 'frame'],
        populate: [
          { path: 'artist', select: ['title', '_id'] },
          { path: 'genre', select: ['title', '_id'] },
          { path: 'period', select: ['title', '_id'] }
        ]
      })
      .lean()

    const coveredAlbumsRes = categorySingle.albums.map(async (album) => {
      const albumCover = await CloudLib.get<CloudFile>(album.albumCover)
      return new AlbumItemDTO(album, albumCover.data.file)
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
