import { CloudLib } from '../lib/cloud.lib'
import { CloudFolder } from '../types/Cloud'
import { ApiError } from '../exceptions/api-errors'
import { sanitizeURL } from '../controllers/synchronize.controller'

class ToyServices {
  async genres() {
    const response = await CloudLib.get<CloudFolder>('Music%26Movies/TOY')

    if (response) {
      return response.data._embedded.items.filter((item) => item.type === 'dir')
    }

    throw ApiError.BadRequest('Incorrect request options')
  }

  async years(path: string, dirOnly?: boolean) {
    const response = await CloudLib.get<CloudFolder>(sanitizeURL(path))

    if (response) {
      const result = response.data._embedded.items
      return dirOnly ? result.filter((item) => item.type === 'dir') : result
    }

    throw ApiError.BadRequest('Incorrect request options')
  }
}

export default new ToyServices()
