import {
  Cloud,
  CloudFolderContent,
  YandexCloudEntity,
  YandexCloudResponse,
  CLoudQueryPayload
} from '../types/cloud.types'
import axios, {AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios'
import CloudEntityFactoryDTO from '../dto/cloud.dto'

export default class YandexCloudApi implements Cloud {
  #client: AxiosInstance
  #domain = process.env['YCLOUD_DOMAIN']
  #cluster = process.env['MAIN_CLUSTER']
  #cloudRootPath: string

  #handlePath(path: string) {
    if (!path.length) return ''
    if (path.startsWith('/')) return path
    return `/${encodeURIComponent(path)}`
  }

  #qBuilder(path: string, cluster?: string) {
    return `${this.#domain}${this.#cloudRootPath}/${cluster || this.#cluster}${this.#handlePath(path)}`
  }

  constructor(cloudRootPath: string) {
    this.#cloudRootPath = cloudRootPath
    this.#client = axios.create({
      headers: { Authorization: String(process.env['YCLOUD_OAUTH_TOKEN']) }
    })
  }

  async getFolders(payload: CLoudQueryPayload, params: AxiosRequestConfig = {}) {
    const { path, cluster } = payload

    if (typeof path !== 'string') {
      throw new Error('"path" is required and should be a string for Yandex Cloud API')
    }

    const query = this.#qBuilder(path, cluster)

    return await this.#client
      .get<YandexCloudResponse<YandexCloudEntity>>(query, params)
      .then(({ config: { url }, data }) => {
        if (!url) {
          throw new Error('"url" property is not found in cloud response')
        }

        return data._embedded.items.map((item) => (
          CloudEntityFactoryDTO.create(item, url)
        ))
      })
      .catch((error: AxiosError) => {
        throw error
      })
  }
  
  async getFolderContent(payload: CLoudQueryPayload): Promise<CloudFolderContent> {
    const { path, cluster } = payload

    if (typeof path !== 'string') {
      throw new Error('"path" is required and should be a string for Yandex Cloud API')
    }

    const query = this.#qBuilder(path, cluster)

    return await this.#client
      .get<YandexCloudResponse<YandexCloudEntity>>(`${query}&limit=100`)
      .then(({ config: { url }, data }) => {
        if (!url) {
          throw new Error('"url" property is not found in cloud response')
        }

        return {
          ...data._embedded,
          items: data._embedded.items.map((item) => (
            CloudEntityFactoryDTO.create(item, url)
          ))
        }
      })
      .catch((error: AxiosError) => {
        throw error
      })
  }

  async getFile(payload: CLoudQueryPayload) {
    const { path, cluster } = payload

    if (typeof path !== 'string') {
      throw new Error('"path" is required and should be a string for Yandex Cloud API')
    }

    const query = this.#qBuilder(path, cluster)

    return await this.#client
      .get<YandexCloudResponse<YandexCloudEntity>>(query)
      .then(({ data }) => data.file)
      .catch((error: AxiosError) => {
        throw error
      })
  }
}
