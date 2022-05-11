import 'module-alias/register'
import { Request } from 'express'
import { Document, PaginateModel, PaginateResult } from 'mongoose'
import { CategoryModel, CategoryResponse, CategoryPageResponse } from '~/types/Category'
import { PaginationOptions } from '~/types/ReqRes'
import { CategoryItemDTO, CategoryPageDTO } from '~/dtos/category.dto'
import { PaginationDTO } from '~/dtos/pagination.dto'
import { CloudLib } from '~/lib/cloud.lib'
import { Frame } from '~/models/frame.model'

class CategoriesServices {
  async list(Model: PaginateModel<any>, req: Request) {
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

    const dbList: PaginateResult<Document<{}, {}, CategoryResponse>> = await Model.paginate<PaginationOptions>({}, options)

    if (dbList) {
      const { totalDocs, totalPages, page } = dbList
      const pagination = new PaginationDTO({ totalDocs, totalPages, page })

      const dbDocs = dbList.docs as unknown as CategoryResponse[]
      const docs = dbDocs.map((category) => new CategoryItemDTO(category))

      return { docs, pagination }
    }
  }

  async single(Model: PaginateModel<any>, req: Request) {
    const response: CategoryPageResponse = await Model.findById(req.params['id'])
      .populate({
        path: 'albums',
        select: ['title', 'albumCover', 'folderid'],
        populate: [
          { path: 'artist', select: ['title', '_id'] },
          { path: 'genre', select: ['title', '_id'] },
          { path: 'period', select: ['title', '_id'] }
        ]
      })
      .populate({
        path: 'framesAlbums',
        select: ['title', 'frame'],
        populate: [
          { path: 'artist', select: ['title', '_id'] },
          { path: 'genre', select: ['title', '_id'] },
          { path: 'period', select: ['title', '_id'] }
        ]
      })
      .lean()

    const albums = await CloudLib.covers(response.albums)
    const result = new CategoryPageDTO(response, albums)

    return result
  }

  async create(Model: PaginateModel<CategoryModel>, title: string) {
    const payload = {
      title,
      albums: [],
      framesAlbums: []
    }

    const newCategory = new Model(payload)
    const savedCategory = await newCategory.save()

    return {
      _id: savedCategory._id,
      title: savedCategory.title
    }
  }
}

export default new CategoriesServices()
