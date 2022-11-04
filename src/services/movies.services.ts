import { Request } from 'express'
import { CloudLib } from '../lib/cloud.lib'
import { CloudFile, CloudFolder } from '../types/Cloud'
import { sanitizeURL } from '../controllers/synchronize.controller'

class MoviesServices {
  async list(req: Request) {
    const response = await CloudLib.get<CloudFolder>(`Music%26Movies/Movies&limit=${req.body['limit']}`)
    return response.data._embedded.items.filter((item) => (
      'media_type' in item && item.media_type === 'video'
    ))
    // const promisedFiles = response.data._embedded.items.map(async (item) => {
    //   if (item.type === 'dir') {
    //     const dirResponse = await CloudLib.get<CloudFolder>(sanitizeURL(item.path))
    //     return dirResponse.data._embedded.items.filter((el) => (
    //       'media_type' in el && el.media_type === 'video'
    //     ))
    //   } else {
    //     return item
    //   }
    // })

    // const result = await Promise.all(promisedFiles)
    // return result.flat()
  }

  async item(path: string) {
    console.log(path)
    const response = await CloudLib.get<CloudFile>(sanitizeURL(path))
    return response.data
  }
}

export default new MoviesServices()
