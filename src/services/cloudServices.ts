import { Cloud } from '../'
import { CloudEntityDTO } from '../dtos/cloud.dto'
import utils from '../utils'

class CloudServices {
  async getImages(body: Record<string, string>) {
    if (!body['path']) {
      throw new Error('Incorrect request options: "path" property is required')
    }

    const satitizedPath = body['path']
      .split('/')
      .reduce((acc, next) => acc + utils.sanitizeURL(next) + '/', '')
      .slice(0, -1)

    const files = await Cloud.getFolderContent(
      `${process.env['COLLECTION_ROOT']}/Collection/${satitizedPath}&limit=100`
    )
    
    if (files) {
      const result = await Promise.allSettled(
        utils.fileFilter(files, utils.imagesMimeTypes)
          .map(async (item) => await this.getImageWithURL(item))
      )

      // @ts-ignore
      return result.map(({ value }) => value)
    }

    throw new Error('Files not found')
  }

  async getImageWithURL(item: Required<CloudEntityDTO>) {
    const fetchedFile = await Cloud.getFile(`${process.env['COLLECTION_ROOT']}/Collection/${item.path}`)
    return { ...item, url: fetchedFile }
  }
}

export default new CloudServices()
