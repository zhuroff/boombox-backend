import { TOYRepository } from '../types/toy.types'
import { CloudEntity, CloudReqPayloadFilter } from '../types/cloud.types'
import { getCloudApi } from '..'

export default class TOYRepositoryContracts implements TOYRepository {
  private satitizePath(path: string) {
    return path
      .split('/')
      .reduce((acc, next) => acc + next + '/', '')
      .slice(0, -1)
  }

  async getFolderContent(filter: Omit<CloudReqPayloadFilter, 'value' | 'exclude'>) {
    const { id, path, cloudURL, limit, offset } = filter

    const cloudApi = getCloudApi(cloudURL)

    return await cloudApi.getFolderContent({
      id,
      fileType: 'file',
      path: `${this.satitizePath(path)}&limit=${limit || 500}&offset=${offset || 0}`
    })
  }

  async getCloudFile(filter: Omit<CloudReqPayloadFilter, 'value' | 'exclude'>) {
    const { id, type, path, cloudURL } = filter
    const cloudApi = getCloudApi(cloudURL)

    return await cloudApi.getFile({
      id,
      fileType: type,
      path: this.satitizePath(path)
    })
  }

  async getImageWithURL(item: Required<CloudEntity>) {
    const fetchedFile = await this.getCloudFile({
      id: item.id,
      path: item.path,
      type: 'image',
      cloudURL: item.cloudURL
    })

    return { ...item, url: fetchedFile }
  }
}
