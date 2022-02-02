import { Request } from 'express'
import { PaginateModel } from 'mongoose'
import { ICategoryDocs, ICategoryResponse } from '~/types/Category'
import { AlbumModel } from '~/types/Album'
import { Frame } from '~/models/frame.model'
import { getAlbumsWithCover } from '~/helpers/covers'

const getCategories = async (Model: PaginateModel<any>, req: Request) => {
  const populates = [
    { path: 'albums', select: ['_id'] },
    { path: 'framesAlbums', select: ['_id'], model: Frame }
  ]

  const options = {
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

  try {
    const response = await Model.paginate({}, options)
    const responseData: ICategoryResponse = {
      docs: response.docs.reduce((acc, next) => {
        acc.push({
          _id: next._id,
          title: next.title,
          avatar: next.avatar,
          albums: next.albums.length + next.framesAlbums.length
        })
        
        return acc
      }, [] as ICategoryDocs[]),

      pagination: {
        totalDocs: response.totalDocs,
        totalPages: response.totalPages,
        page: response.page || 1,
      }
    }

    return responseData
  } catch (error) {
    return error
  }
}

const getCategory = async (Model: PaginateModel<any>, req: Request) => {
  try {
    const response = await Model.findById(req.params['id'])
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
        select: ['title', 'iframe'],
        populate: [
          { path: 'artist', select: ['title', '_id'] },
          { path: 'genre', select: ['title', '_id'] },
          { path: 'period', select: ['title', '_id'] }
        ]
      })
      .lean()

    const coveredCategory = {
      avatar: response.avatar,
      poster: response.poster,
      title: response.title,
      _id: response._id,
      albums: await getAlbumsWithCover(response.albums as unknown as AlbumModel[]),
      frames: response.framesAlbums
    }

    return coveredCategory
  } catch (error) {
    return error
  }
}

const uploadCategoryFiles = async (Model: PaginateModel<any>, req: Request) => {
  try {
    if (req.file) {
      const $set: any = {}
      const setKey = req.file.fieldname

      $set[setKey as string] = `/uploads/${req.file.filename}`

      const response = await Model.findOneAndUpdate({
        _id: req.params['id']
      }, { $set }, { new: true })
      
      return response
    }    
  } catch (error) {
    return error
  }
}

export {
  getCategories,
  getCategory,
  uploadCategoryFiles
}
