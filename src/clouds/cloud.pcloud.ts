import axios, { AxiosError, AxiosInstance } from 'axios'
import { Cloud, PCloudEntity, PCloudResponseError, PCloudFileResponse, PCloudResponse, CloudFileTypes, CloudFolderContent } from '../types/cloud.types'
import CloudEntityFactoryDTO from '../dto/cloud.dto'
import utils from '../utils'

export default class PCloudApi implements Cloud {
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
    const query = this.#qBuilder(`listfolder?path=/${this.#cloudRootPath}/Collection${path}`)

    return await this.#client
      .get<PCloudResponse<PCloudEntity> | PCloudResponseError>(query)
      .then(({ config: { url }, data }) => {
        if (!url) {
          throw new Error('"url" property is not found in cloud response')
        }

        if ('error' in data) {
          throw new Error(`${data.result}: ${data.error}`)
        }

        return data.metadata.contents.map((item) => (
          CloudEntityFactoryDTO.create(item, url)
        ))
      })
      .catch((error: AxiosError) => {
        console.error(error)
        throw error
      })
  }

  async getFolderContent(path: string, root?: string): Promise<CloudFolderContent> {
    this.#digest = await this.#getDigest()
    const query = this.#qBuilder(`listfolder?path=/${this.#cloudRootPath}/${root || 'Collection/'}${path}&limit=100`)

    return await this.#client
      .get<PCloudResponse<PCloudEntity> | PCloudResponseError>(query)
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
          items: data.metadata.contents.map((item) => (
            CloudEntityFactoryDTO.create(item, url, root)
          ))
        }
      })
      .catch((error: AxiosError) => {
        console.error(error)
        throw error
      })
  }

  async getFile(path: string, fileType: CloudFileTypes, root?: string) {
    this.#digest = await this.#getDigest()
    const targetFileType = this.#fileTypesMap.get(fileType)
    const query = this.#qBuilder(`${targetFileType}?path=/${this.#cloudRootPath}/${root || 'Collection/'}${path}`)

    return await this.#client
      .get<PCloudFileResponse | PCloudResponseError>(query)
      .then(async ({ data }) => {
        if ('error' in data) {
          throw new Error(`${data.result}: ${data.error}`)
        }

        return this.#getFileLink(data)
      })
      .catch((error: AxiosError) => {
        console.error(error)
        throw error
      })
  }
}
