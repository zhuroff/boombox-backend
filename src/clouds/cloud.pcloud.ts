import {
  Cloud,
  PCloudEntity,
  PCloudResponseError,
  PCloudFileResponse,
  PCloudResponse,
  CloudFolderContent,
  CLoudQueryPayload
} from '../types/cloud'
import { createHash } from 'node:crypto'
import axios, { AxiosError, AxiosInstance } from 'axios'
import CloudEntityViewFactory from '../views/CloudEntityViewFactory'

export default class PCloudApi implements Cloud {
  #client: AxiosInstance
  #domain = process.env['PCLOUD_DOMAIN']
  #login = process.env['PCLOUD_LOGIN']
  #password = process.env['PCLOUD_PASSWORD']
  #digest = ''
  #sha1 = (str?: string) => {
    return str ? createHash('sha1').update(str).digest('hex') : ''
  }

  constructor() {
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

  #qBuilder(path: string, qMethod?: string) {
    return (`
      ${this.#domain}/
      ${qMethod || 'listfolder'}?path=
      ${path}
      &username=${this.#login}
      &digest=${this.#digest}
      &passworddigest=${this.#sha1(this.#password + this.#sha1(this.#login) + this.#digest)}
    `).replace(/\s{2,}/g, '')
  }

  async getFolders(payload: CLoudQueryPayload) {
    const { path } = payload

    if (typeof path !== 'string') {
      throw new Error('"path" is required and should be a string for PCloud API')
    }

    this.#digest = await this.#getDigest()
    const query = this.#qBuilder(path)

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
    const { path } = payload

    if (typeof path !== 'string') {
      throw new Error('"path" is required and should be a string for PCloud API')
    }

    this.#digest = await this.#getDigest()
    const query = this.#qBuilder(`/${path}`)

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
    const { path, fileType } = payload

    if (typeof path !== 'string') {
      throw new Error('"path" is required and should be a string for PCloud API')
    }

    if (!fileType) {
      throw new Error('"fileType" is required and should be a string for PCloud API')
    }

    this.#digest = await this.#getDigest()
    const query = this.#qBuilder(`/${path}`, 'getfilelink')

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
        return undefined
      })
  }
}
