import axios, { AxiosInstance } from 'axios'
import utils from '../utils'
import { Cloud, PCloudEntity, PCloudResponseError, PCloudFileResponse, PCloudResponse, CloudFileTypes } from '../types/cloud.types'
import { CloudEntityDTO } from '../dto/cloud.dto'

export class PCloudApi implements Cloud {
  #client: AxiosInstance
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
    this.#cloudRootPath = cloudRootPath
    this.#client = axios.create({})
  }

  async #getDigest() {
    return this.#client
      .get(`${this.#domain}/getdigest`)
      .then(({ data }) => data.digest)
      .catch(console.error)
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
    return await this.#client
      .get<PCloudResponse<PCloudEntity> | PCloudResponseError>(this.#qBuilder(
        `listfolder?path=/${this.#cloudRootPath}/Collection${path}`
      ))
      .then(({ config: { url }, data }) => {
        if (!url) {
          throw new Error('"url" property is not found in cloud response')
        }
        if ('error' in data) {
          throw new Error(`${data.result}: ${data.error}`)
        }
        return data.metadata.contents.map((item) => new CloudEntityDTO(item, url))
      })
      .catch((error) => {
        console.error(error)
        return null
      })
  }

  async getFolderContent(path: string, root?: string) {
    this.#digest = await this.#getDigest()
    return await this.#client
      .get<PCloudResponse<PCloudEntity> | PCloudResponseError>(this.#qBuilder(
        `listfolder?path=/${this.#cloudRootPath}/${root || 'Collection/'}${path}`
      ))
      .then(({ config: { url }, data }) => {
        if (!url) {
          throw new Error('"url" property is not found in cloud response')
        }
        if ('error' in data) {
          throw new Error(`${data.result}: ${data.error}`)
        }
        return {
          limit: -1,
          offset: 0,
          total: data.metadata.contents.length,
          items: data.metadata.contents.map((item) => new CloudEntityDTO(item, url, root))
        }
      })
      .catch((error) => console.error(error))
  }

  async getFile(path: string, fileType: CloudFileTypes, root?: string) {
    this.#digest = await this.#getDigest()
    return await this.#client
      .get<PCloudFileResponse | PCloudResponseError>(this.#qBuilder(
        `${this.#fileTypesMap.get(fileType)}?path=/${this.#cloudRootPath}/${root || 'Collection/'}${path}`
      ))
      .then(async ({ data }) => {
        if ('error' in data) {
          throw new Error(`${data.result}: ${data.error}`)
        }
        return this.#getFileLink(data)
      })
      .catch((error) => {
        console.error(error.message)
        return undefined
      })
  }
}
