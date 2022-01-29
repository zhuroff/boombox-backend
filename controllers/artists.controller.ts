import 'module-alias/register'
import { Request, Response } from 'express'
import { Artist } from '~/models/artist.model'
import { Frame } from '~/models/frame.model'
import { ICategoryDocs, ICategoryResponse } from '~/types/Category'
import { AlbumModelDocument } from '~/types/Album'
import { getAlbumsWithCover } from '~/helpers/covers'

const list = async (req: Request, res: Response) => {
  const populates = [
    { path: 'albums', select: ['_id'] },
    { path: 'framesAlbums', select: ['_id'], model: Frame }
  ]

  const options = {
    page: req.body.current,
    limit: req.body.limit,
    sort: req.body.sorting,
    populate: populates,
    lean: true,
    select: {
      title: true,
      avatar: true
    }
  }
  
  try {
    const response = await Artist.paginate({}, options)
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
        limit: response.limit,
        totalPages: response.totalPages,
        page: response.page || 1,
      }
    }

    res.json(responseData)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

const single = async (req: Request, res: Response) => {
  try {
    Artist.findById(req.params['id'])
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
      .exec(async (error, artist) => {
        if (error) return res.status(500).json(error)

        const artistResponse = {
          avatar: artist.avatar,
          poster: artist.poster,
          title: artist.title,
          _id: artist._id,
          albums: await getAlbumsWithCover(artist.albums as unknown as AlbumModelDocument[]),
          frames: artist.framesAlbums
        }

        res.json(artistResponse)
      })
  } catch (error) {
    res.status(500).json(error)
  }
}

const upload = async (req: Request, res: Response) => {
  // const $set = {}
  // $set[req.file.fieldname] = `/uploads/${req.file.filename}`

  // try {
  //   const response = await Artist.findOneAndUpdate({
  //     _id: req.params.id
  //   }, { $set }, { new: true })
    
  //   res.json(response)
  // } catch (error) {
  //   res.status(500).json(error)
  // }
}

const controller = {
  list,
  single,
  upload
}

export default controller
