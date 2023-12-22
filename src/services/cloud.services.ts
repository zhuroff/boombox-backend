import { CloudApi } from '../types/cloud.types'
import { CloudEntityDTO } from '../dto/cloud.dto'
import { getCloudApi } from '..'
import utils from '../utils'

export default {
  async getImages({
    path,
    cloudURL,
    limit,
    offset
  }: {
    path: string,
    cloudURL: string,
    limit: number,
    offset: number
  }) {
    if (!path || !cloudURL) {
      throw new Error('Incorrect request options: both "path" and "cloudURL" properties are required')
    }

    const cloudApi = getCloudApi(cloudURL)
    const satitizedPath = path
      .split('/')
      .reduce((acc, next) => acc + utils.sanitizeURL(next) + '/', '')
      .slice(0, -1)

    const content = await cloudApi.getFolderContent(
      `${satitizedPath}&limit=${limit}&offset=${offset}`
    )
    
    if (content) {
      const finalContent = {
        ...content,
        items: await Promise.allSettled(
          utils.fileFilter(content.items, utils.imagesMimeTypes)
            .map(async (item) => await this.getImageWithURL(item, cloudApi))
        ) as PromiseFulfilledResult<Required<CloudEntityDTO>>[]
      }

      return {
        ...finalContent,
        items: finalContent.items.map(({ value }) => value)}
    }

    throw new Error('Files not found')
  },

  async getTrackDuration({ path, cloudURL }: { path: string, cloudURL: string }) {
    if (!path || !cloudURL) {
      throw new Error('Incorrect request options: both "path" and "cloudURL" properties are required')
    }

    const cloudApi = getCloudApi(cloudURL)
    return cloudApi.getFile(path, 'file')
  },

  async getImageWithURL(item: Required<CloudEntityDTO>, cloudApi: CloudApi) {
    const fetchedFile = await cloudApi.getFile(item.path, 'image')
    return { ...item, url: fetchedFile }
  }
}
