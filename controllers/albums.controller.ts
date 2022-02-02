import 'module-alias/register'
import { Request, Response } from 'express'
import { Album } from '~/models/album.model'
import { TrackModel }  from '~/types/Track'
import { CloudAlbumFile } from '~/types/Album'
import { Artist } from '~/models/artist.model'
import { Genre } from '~/models/genre.model'
import { Period } from '~/models/period.model'
import { Collection } from '~/models/collection.model'
import { fetchers } from '~/helpers/fetchers'
import { getAlbumsWithCover, getImageLink} from '~/helpers/covers'
import getTracksLinks from '~/helpers/tracks'

const list = async (req: Request, res: Response) => {
  try {
    const populates = [
      { path: 'artist', select: ['title'], model: Artist },
      { path: 'genre', select: ['title'], model: Genre },
      { path: 'period', select: ['title'], model: Period },
      { path: 'inCollections', select: ['title'], model: Collection }
    ]
    
    const options = {
      page: req.body.page,
      limit: req.body.limit,
      sort: req.body.sort,
      populate: populates,
      lean: true,
      select: {
        title: true,
        albumCover: true
      }
    }

    const response = await Album.paginate({}, options)

    if (response) {
      const result = await getAlbumsWithCover(response)

      res.json({
        pagination: {
          totalDocs: response.totalDocs,
          totalPages: response.totalPages,
          page: response.page,
        },
        docs: result
      })
    } else {
      const error = new Error('There is no data')
      throw error
    }
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

const single = async (req: Request, res: Response) => {
  try {
    const album = await Album.findById(req.params['id'])
      .populate({ path: 'artist', select: ['title'] })
      .populate({ path: 'genre', select: ['title'] })
      .populate({ path: 'period', select: ['title'] })
      .populate({ path: 'tracks', populate: { path: 'artist', select: ['title'] } })
      .lean()

    const preparedAlbum = {
      ...album,
      albumCover: await getImageLink(Number(album.albumCover)),
      tracks: await getTracksLinks(album.tracks as unknown as TrackModel[])
    }

    res.json(preparedAlbum)
  } catch (error) {
    res.status(500).json(error)
  }
}

const description = async (req: Request, res: Response) => {
  try {
    await Album.updateOne({ _id: req.params['id'] }, { $set: { description: req.body.description } })
    res.status(201).json({ message: 'Description updated' })
  } catch (error) {
    res.status(500).json(error)
  }
}

const booklet = async (req: Request, res: Response) => {
  try {
    const folderQuery = fetchers.cloudQueryLink(`listfolder?folderid=${req.params['booklet']}`)
    const listFolder = await fetchers.getData(folderQuery)
    const fileContents: CloudAlbumFile[] = listFolder.data.metadata.contents
    const preparedData = fileContents.map((el) => ({ albumCover: el.fileid }))
    const result = await getAlbumsWithCover(preparedData)
    
    res.status(201).json(result)
  } catch (error) {
    res.status(500).json(error)
  }
}

const controller = {
  list,
  single,
  description,
  booklet
}

export default controller
