import {
  Cloud,
  PCloudEntity,
  PCloudResponseError,
  PCloudFileResponse,
  PCloudResponse,
  CloudFileTypes,
  CloudFolderContent,
  CLoudQueryPayload
} from '../types/cloud.types'
import { createHash } from 'node:crypto'
import axios, { AxiosError, AxiosInstance } from 'axios'
import CloudEntityViewFactory from '../views/CloudEntityViewFactory'

export default class PCloudApi implements Cloud {
  #client: AxiosInstance
  #domain = process.env['PCLOUD_DOMAIN']
  #cluster = process.env['MAIN_CLUSTER']
  #login = process.env['PCLOUD_LOGIN']
  #password = process.env['PCLOUD_PASSWORD']
  #digest = ''
  #cloudRootPath: string
  #fileTypesMap = new Map<CloudFileTypes, string>([
    ['audio', 'getaudiolink'],
    ['video', 'getvideolink'],
    ['image', 'getfilelink'],
    ['file', 'getfilelink'],
  ])
  #sha1 = (str?: string) => {
    return str ? createHash('sha1').update(str).digest('hex') : ''
  }

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

  #handlePath(path: string) {
    if (!path.length) return ''
    if (path.startsWith('/')) return path
    return `/${encodeURIComponent(path)}`
  }

  #qBuilder(path: string, cluster?: string, qMethod?: string) {
    return (`
      ${this.#domain}/
      ${qMethod || 'listfolder'}?path=/
      ${this.#cloudRootPath}/
      ${cluster || this.#cluster}
      ${this.#handlePath(path)}
      &username=${this.#login}
      &digest=${this.#digest}
      &passworddigest=${this.#sha1(this.#password + this.#sha1(this.#login) + this.#digest)}
    `).replace(/\s{2,}/g, '')
  }

  async getFolders(payload: CLoudQueryPayload) {
    const { path, cluster } = payload

    if (typeof path !== 'string') {
      throw new Error('"path" is required and should be a string for PCloud API')
    }

    this.#digest = await this.#getDigest()
    const query = this.#qBuilder(path, cluster)

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
          CloudEntityViewFactory.create(item, url)
        ))
      })
      .catch((error: AxiosError) => {
        throw error
      })
  }

  async getFolderContent(payload: CLoudQueryPayload): Promise<CloudFolderContent> {
    const { path, cluster } = payload

    if (typeof path !== 'string') {
      throw new Error('"path" is required and should be a string for PCloud API')
    }

    this.#digest = await this.#getDigest()
    const query = this.#qBuilder(path, cluster)

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
            CloudEntityViewFactory.create(item, url)
          ))
        }
      })
      .catch((error: AxiosError) => {
        throw error
      })
  }

  async getFile(payload: CLoudQueryPayload) {
    const { path, fileType, cluster } = payload

    if (typeof path !== 'string') {
      throw new Error('"path" is required and should be a string for PCloud API')
    }

    if (!fileType) {
      throw new Error('"fileType" is required and should be a string for PCloud API')
    }

    this.#digest = await this.#getDigest()
    const targetFileType = this.#fileTypesMap.get(fileType)
    const query = this.#qBuilder(path, cluster, targetFileType)

    return await this.#client
      .get<PCloudFileResponse | PCloudResponseError>(query)
      .then(async ({ data }) => {
        if ('error' in data) {
          throw new Error(`${data.result}: ${data.error}`)
        }

        return this.#getFileLink(data)
      })
      .catch((error: AxiosError) => {
        throw error
      })
  }
}
