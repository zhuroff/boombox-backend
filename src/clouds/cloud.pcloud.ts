import utils from '../utils'
import { CloudExternalApi } from './cloud.external'
import { CloudEntityDTO } from '../dtos/cloud.dto'
import { CloudAPI, PCloudEntity, PCloudResponseError, PCloudFileResponse, PCloudResponse, CloudFileTypes } from '../types/Cloud'

export class PCloudApi extends CloudExternalApi implements CloudAPI {
  #domain = process.env['PCLOUD_DOMAIN']
  #login = process.env['PCLOUD_LOGIN']
  #password = process.env['PCLOUD_PASSWORD']
  #fileTypesMap = new Map<CloudFileTypes, string>([
    ['audio', 'getaudiolink'],
    ['video', 'getvideolink'],
    ['image', 'getfilelink'],
    ['file', 'getfilelink'],
  ])
  #digest = ''
  #cloudRootPath: string

  constructor(cloudRootPath: string) {
    super()
    this.#cloudRootPath = cloudRootPath
  }

  async #getDigest() {
    return this.client
      .get(`${this.#domain}/getdigest`)
      .then(({ data }) => data.digest)
      .catch((error) => console.log(error))
  }

  #getFileLink(entity: PCloudFileResponse) {
    return `https://${entity.hosts[0]}${entity.path}`.replace('.mp3', '')
  }

  #qBuilder(path: string) {
    return (`
      ${this.#domain}/
      ${path}
      &username=${this.#login}
      &digest=${this.#digest}
      &passworddigest=${utils.sha1(this.#password + utils.sha1(this.#login) + this.#digest)}
    `).replace(/\s{2,}/g, '')
  }

  async getFolders(path: string) {
    this.#digest = await this.#getDigest()
    return await this.client
      .get<PCloudResponse<PCloudEntity> | PCloudResponseError>(this.#qBuilder(
        `listfolder?path=/${this.#cloudRootPath}/${path}`
      ))
      .then(({ data }) => {
        if ('error' in data) {
          throw new Error(`${data.result}: ${data.error}`)
        }
        return data.metadata.contents.map((item) => new CloudEntityDTO(item))
      })
      .catch((error) => console.log('getFolders', error))
  }

  async getFolderContent(path: string) {
    this.#digest = await this.#getDigest()
    return await this.client
      .get<PCloudResponse<PCloudEntity> | PCloudResponseError>(this.#qBuilder(
        `listfolder?path=/${this.#cloudRootPath}/${path}`
      ))
      .then(({ data }) => {
        if ('error' in data) {
          throw new Error(`${data.result}: ${data.error}`)
        }
        return {
          limit: -1,
          offset: 0,
          total: data.metadata.contents.length,
          items: data.metadata.contents.map((item) => new CloudEntityDTO(item))
        }
      })
      .catch((error) => console.log('getFolderContent', error))
  }

  async getFile(path: string, fileType: CloudFileTypes) {
    this.#digest = await this.#getDigest()
    return await this.client
      .get<PCloudFileResponse | PCloudResponseError>(this.#qBuilder(
        `${this.#fileTypesMap.get(fileType)}?path=/${this.#cloudRootPath}/${path}`
      ))
      .then(async ({ data }) => {
        if ('error' in data) {
          throw new Error(`${data.result}: ${data.error}`)
        }
        return this.#getFileLink(data)
      })
      .catch((error) => console.log('getFile', error.message))
  }
}
