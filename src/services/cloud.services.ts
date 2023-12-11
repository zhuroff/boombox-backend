import { Cloud } from '..'
import { CloudEntityDTO } from '../dtos/cloud.dto'
import utils from '../utils'

export default {
  async getImages(body: Record<string, string>) {
    if (!body['path']) {
      throw new Error('Incorrect request options: "path" property is required')
    }

    const satitizedPath = body['path']
      .split('/')
      .reduce((acc, next) => acc + utils.sanitizeURL(next) + '/', '')
      .slice(0, -1)

    const content = await Cloud.getFolderContent(
      `${satitizedPath}&limit=${body['limit']}&offset=${body['offset']}`
    )
    
    if (content) {
      const finalContent = {
        ...content,
        items: await Promise.allSettled(
          utils.fileFilter(content.items, utils.imagesMimeTypes)
            .map(async (item) => await this.getImageWithURL(item))
        ) as PromiseFulfilledResult<Required<CloudEntityDTO>>[]
      }

      return {
        ...finalContent,
        items: finalContent.items.map(({ value }) => value)}
    }

    throw new Error('Files not found')
  },

  async getTrackDuration(body: Record<string, string>) {
    if (!body['path']) {
      throw new Error('Incorrect request options: "path" property is required')
    }

    return await Cloud.getFile(body['path'], 'file')
  },

  async getImageWithURL(item: Required<CloudEntityDTO>) {
    const fetchedFile = await Cloud.getFile(item.path, 'image')
    return { ...item, url: fetchedFile }
  }
}
