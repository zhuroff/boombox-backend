import 'module-alias/register'
import { Request, Response } from 'express'
import { PaginateModel } from 'mongoose'
import { CloudLib } from '~/lib/cloud.lib'
import { Album } from '~/models/album.model'
import { Frame } from '~/models/frame.model'
import { Artist } from '~/models/artist.model'
import { Genre } from '~/models/genre.model'
import { Period } from '~/models/period.model'

type SearchModels = 'albums' | 'frames' | 'artists' | 'genres' | 'periods'

type SearchParams = { '$text': { '$search': string } }

type SearchModel = {
  instance: PaginateModel<any> | null
  options: { [index: string]: boolean }
  populates: {
    path: string
    select: string[]
  }[] | null
}

const searchModels = {
  albums: {
    instance: Album,
    options: {
      _id: true,
      title: true,
      artist: true,
      genre: true,
      albumCover: true,
      releaseYear: true
    },
    populates: [
      { path: 'artist', select: ['title'] },
      { path: 'genre', select: ['title'] }
    ]
  },

  frames: {
    instance: Frame,
    options: {
      _id: true,
      title: true,
      artist: true,
      genre: true,
      releaseYear: true
    },
    populates: [
      { path: 'artist', select: ['title'] },
      { path: 'genre', select: ['title'] },
      { path: 'releaseYear', select: ['title'] }
    ]
  },

  artists: {
    instance: Artist,
    options: { _id: true, title: true, poster: true, avatar: true }
  },

  genres: {
    instance: Genre,
    options: { _id: true, title: true, poster: true, avatar: true }
  },

  periods: {
    instance: Period,
    options: { _id: true, title: true, poster: true, avatar: true }
  }
}

class SearchHandler {
  params: SearchParams = { $text: { $search: '' } }
  model: SearchModel = {
    instance: null,
    options: {},
    populates: null
  }

  constructor(params: any, model: any) {
    this.params = params
    this.model = model
  }

  async searchEntries() {
    try {
      if (this.model?.instance) {
        return await this.model.instance
          .find(this.params, this.model.options)
          .populate(this.model.populates)
          .lean()
      }
    } catch (error) {
      return error
    }
  }
}

const search = async (req: Request, res: Response) => {
  try {
    const searchParams: SearchParams = { $text: { $search: req.body.query } }
    const searchKey: SearchModels | undefined = req.body.key

    if (searchKey) {
      const searchInstance = new SearchHandler(searchParams, searchModels[searchKey])
      const result = await searchInstance.searchEntries()
      res.status(200).json(result)
    } else {
      // const result = {}

      // await Promise.all(Object.keys(searchModels).map(async (key) => {
      //   const searchInstance = new SearchHandler(searchParams, searchModels[key as SearchModels])
      //   result[key] = await searchInstance.searchEntries()
        
      //   if (key === 'albums') {
      //     result[key] = await getAlbumsWithCover(result[key])
      //   }

      //   return
      // }))

      // res.status(200).json(result)
    }
  } catch (error) {
    res.status(500).json(error)
  }
}

const news = async (req: Request, res: Response) => {
  // try {
  //   const params = {
  //     page_size: 33,
  //     location: 'spb',
  //     text_format: 'text',
  //     page: req.body.page,
  //     categories: 'concert',
  //     actual_since: new Date().toISOString(),
  //     fields: 'id,title,dates,description,is_free,images,site_url,price',
  //   }
  //   
  //   // REPLACE WITH CloudLib.get
  //   const response = await fetchers.getData('https://kudago.com/public-api/v1.4/events/', { params: params })

  //   response.data.results.sort((a, b) => {
  //     if (a.dates[0].end < b.dates[0].end) return -1
  //     if (a.dates[0].end > b.dates[0].end) return 1
  //     return 0
  //   })

  //   res.json(response.data)
  // } catch (error) {
  //   res.status(500).json(error.response.data)
  // }
}

const discogs = async (req: Request, res: Response) => {
  const discogsUrl = `
    type=release
    &artist=${req.body.artist}
    &release_title=${req.body.album}
    &page=${req.body.page}
    &sort=released
    &per_page=100
  `

  try {
    const discogsQuery = CloudLib.discogsQueryLink(discogsUrl)
    const discogsResponse = await CloudLib.get(encodeURI(discogsQuery))

    res.json(discogsResponse.data)
  } catch (error) {
    res.status(500).json(error)
  }
}

const controller = {
  search,
  news,
  discogs
}

export default controller
