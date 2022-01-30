import 'module-alias/register'
import { Request, Response } from 'express'
import { PaginateModel, Types } from 'mongoose'
import { CategoryModel } from '~/types/Category'
import { Frame } from '~/models/frame.model'
import { Artist } from '~/models/artist.model'
import { Genre } from '~/models/genre.model'
import { Period } from '~/models/period.model'

const saveAlbumToCategory = async (
  ...args: [PaginateModel<any>, Types.ObjectId, Types.ObjectId]
): Promise<CategoryModel> => {
  const [Model, id, albumID] = args
  const query = { _id: id }
  const update = { $push: { framesAlbums: albumID } }
  const options = { upsert: true, new: true, setDefaultsOnInsert: true }

  try {
    return await Model.findOneAndUpdate(query, update, options)
    // const category: CategoryAlbum = await Model.findOne({ _id: id })

    // if (!category && !category['framesAlbums']?.length) {
    //   category.framesAlbums.push(albumID)
    // } else {
    //   const is_exist = category.framesAlbums.findIndex((el) => el == albumID) > -1

    //   if (!is_exist) {
    //     category.framesAlbums.push(albumID)
    //   }
    // }
    
    // category.save()
  } catch (error) {
    throw error
  }
}

const removeAlbumFromCategory = async (
  ...args: [PaginateModel<any>, Types.ObjectId, string]
): Promise<CategoryModel> => {
  const [Model, id, albumID] = args
  const query = { _id: id }
  const update = { $pull: { framesAlbums: albumID } }
  const options = { new: true }

  try {
    return await Model.findOneAndUpdate(query, update, options)
    // const category = await Model.findOne({ _id: id }).exec()
    // const filteredAlbums = category.framesAlbums.filter((el) => el.toString() !== albumID.toString())

    // await Model.updateOne({ _id: id }, { $set: { framesAlbums: filteredAlbums } })
  } catch (error) {
    throw error
  }
}

const create = async (req: Request, res: Response) => {
  const newBCAlbum = new Frame(req.body)
  
  try {
    const dbAlbum = await newBCAlbum.save()

    await saveAlbumToCategory(Artist, req.body.artist, dbAlbum._id)
    await saveAlbumToCategory(Genre, req.body.genre, dbAlbum._id)
    await saveAlbumToCategory(Period, req.body.releaseYear, dbAlbum._id)

    const createdFrame = await Frame.findById(dbAlbum._id)
      .populate({ path: 'artist', select: ['title'] })
      .populate({ path: 'genre', select: ['title'] })
      .populate({ path: 'period', select: ['title'] })

    res.json(createdFrame)
  } catch (error) {
    res.status(500).json(error)
  }
}

const list = async (req: Request, res: Response) => {
  try {
    const populates = [
      { path: 'artist', select: ['title'] },
      { path: 'genre', select: ['title'] },
      { path: 'periods', select: ['title'] }
    ]

    const options = {
      page: req.body.page,
      limit: req.body.limit,
      sort: req.body.sort,
      populate: populates,
      lean: true,
      select: {
        title: true,
        iframe: true
      }
    }

    const response = await Frame.paginate({}, options)
    res.json(response)
  } catch (error) {
    res.status(500).json(error)
  }
}

const single = async (req: Request, res: Response) => {
  try {
    const response = await Frame.findById(req.params['id'])
      .populate({ path: 'artist', select: ['title'] })
      .populate({ path: 'genre', select: ['title'] })
      .populate({ path: 'period', select: ['title'] })

    res.json(response)
  } catch (error) {
    res.status(500).json(error)
  }
}

const remove = async (req: Request, res: Response) => {
  try {
    if (req.params['id']) {
      await Frame.deleteOne({ _id: req.params['id'] })

      await removeAlbumFromCategory(Artist, req.body.artist, req.params['id'])
      await removeAlbumFromCategory(Genre, req.body.genre, req.params['id'])
      await removeAlbumFromCategory(Period, req.body.period, req.params['id'])

      res.json({ message: 'Album successfully deleted' })
    }
  } catch (error) {
    res.status(500).json(error)
  }
}

const controller = {
  create,
  list,
  single,
  remove
}

export default controller
