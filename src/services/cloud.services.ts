import { CloudApi } from '../types/cloud.types'
import { CloudEntityDTO } from '../dto/cloud.dto'
import { getCloudApi } from '..'
import { CloudReqPayload, CloudReqPayloadFilter } from '../types/reqres.types'
import utils from '../utils'

export default {
  async getImages({ path, cloudURL, limit, offset, root }: Required<CloudReqPayloadFilter>) {
    if (!path || !cloudURL) {
      throw new Error('Incorrect request options: both "path" and "cloudURL" properties are required')
    }

    const cloudApi = getCloudApi(cloudURL)
    const satitizedPath = path
      .split('/')
      .reduce((acc, next) => acc + utils.sanitizeURL(next) + '/', '')
      .slice(0, -1)

    const content = await cloudApi.getFolderContent(
      `${satitizedPath}&limit=${limit}&offset=${offset}`,
      root
    )
    
    if (content) {
      const finalContent = {
        ...content,
        items: await Promise.allSettled(
          utils.fileFilter(content.items, utils.imagesMimeTypes)
            .map(async (item) => await this.getImageWithURL(item, cloudApi, root))
        ) as PromiseFulfilledResult<Required<CloudEntityDTO>>[]
      }

      return {
        ...finalContent,
        items: finalContent.items.map(({ value }) => value)}
    }

    throw new Error('Files not found')
  },
  async getFile({ path, cloudURL, type, root }: Required<CloudReqPayloadFilter>) {
    if (!path || !cloudURL || !type) {
      throw new Error('Incorrect request options: both "path" and "cloudURL" properties are required')
    }

    const cloudApi = getCloudApi(cloudURL)
    const satitizedPath = path
      .split('/')
      .reduce((acc, next) => acc + utils.sanitizeURL(next) + '/', '')
      .slice(0, -1)

    const file = await cloudApi.getFile(satitizedPath, type, root)
    
    if (file) {
      return file
    }

    throw new Error('File not found')
  },
  async getTrackDuration({ path, cloudURL }: CloudReqPayload) {
    if (!path || !cloudURL) {
      throw new Error('Incorrect request options: both "path" and "cloudURL" properties are required')
    }

    const cloudApi = getCloudApi(cloudURL)
    return cloudApi.getFile(path, 'file')
  },
  async getImageWithURL(item: Required<CloudEntityDTO>, cloudApi: CloudApi, root?: string) {
    const fetchedFile = await cloudApi.getFile(item.path, 'image', root)
    return { ...item, url: fetchedFile }
  },
  async getFolderContent({ path, cloudURL, root, limit, offset }: CloudReqPayloadFilter) {
    if ([path, cloudURL].some((prop) => typeof prop === 'undefined')) {
      throw new Error('Incorrect request options: both "path" and "cloudURL" properties are required')
    }

    const cloudApi = getCloudApi(cloudURL)
    const satitizedPath = path
      .split('/')
      .reduce((acc, next) => acc + utils.sanitizeURL(next) + '/', '')
      .slice(0, -1)

    const content = await cloudApi.getFolderContent(
      `${satitizedPath}&limit=${limit || 500}&offset=${offset || 0}`,
      root
    )

    if (content) {
      return content
    }

    throw new Error('Content not found')
  }
}
