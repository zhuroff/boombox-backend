import { CloudLib } from '../lib/cloud.lib'
import { CloudFolder } from '../types/Cloud'
import { TOYPage } from '../models/toy.model'
import utils from '../utils'

class ToyServices {
  async genres() {
    const response = await CloudLib.get<CloudFolder>(`${process.env['COLLECTION_ROOT']}/TOY`)

    if (response) {
      return response.data._embedded.items.filter((item) => (
        item.type === 'dir' || item.mime_type === 'image/webp'
      ))
    }

    throw new Error('Incorrect request options')
  }

  async years(path: string, dirOnly: boolean = true) {
    const response = await CloudLib.get<CloudFolder>(utils.sanitizeURL(path))

    if (response) {
      const result = response.data._embedded.items
      return dirOnly ? result.filter((item) => item.type === 'dir') : result
    }

    throw new Error('Incorrect request options')
  }

  async year(folderId: string) {
    const response = await TOYPage.findOne({ folderId })
    return response || { notExist: true }
  }
}

export default new ToyServices()
