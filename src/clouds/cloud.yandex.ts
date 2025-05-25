import {
  Cloud,
  CloudFolderContent,
  YandexCloudEntity,
  YandexCloudResponse,
  CLoudQueryPayload
} from '../types/cloud.types'
import axios, {AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios'
import CloudEntityViewFactory from '../views/CloudEntityViewFactory'

export default class YandexCloudApi implements Cloud {
  #client: AxiosInstance
  #domain = process.env['YCLOUD_DOMAIN']

  #qBuilder(path: string) {
    return `${this.#domain}${path}`
  }

  constructor() {
    this.#client = axios.create({
      headers: { Authorization: String(process.env['YCLOUD_OAUTH_TOKEN']) }
    })
  }

  async getFolders(payload: CLoudQueryPayload, params: AxiosRequestConfig = {}) {
    const { path } = payload

    if (typeof path !== 'string') {
      throw new Error('"path" is required and should be a string for Yandex Cloud API')
    }

    const query = this.#qBuilder(path)

    return await this.#client
      .get<YandexCloudResponse<YandexCloudEntity>>(`${query}&limit=100`, params)
      .then(({ config: { url }, data }) => {
        if (!url) {
          throw new Error('"url" property is not found in cloud response')
        }

        return data._embedded.items.map((item) => (
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
      throw new Error('"path" is required and should be a string for Yandex Cloud API')
    }

    const query = this.#qBuilder(path)

    return await this.#client
      .get<YandexCloudResponse<YandexCloudEntity>>(`${query}&limit=100`)
      .then(({ config: { url }, data }) => {
        if (!url) {
          throw new Error('"url" property is not found in cloud response')
        }

        return {
          ...data._embedded,
          items: data._embedded.items.map((item) => (
            CloudEntityViewFactory.create(item, url)
          ))
        }
      })
      .catch((error: AxiosError) => {
        throw error
      })
  }

  async getFile(payload: CLoudQueryPayload) {
    const { path } = payload

    if (typeof path !== 'string') {
      throw new Error('"path" is required and should be a string for Yandex Cloud API')
    }

    const query = this.#qBuilder(path)

    return await this.#client
      .get<YandexCloudResponse<YandexCloudEntity>>(query)
      .then(({ data }) => data.file)
      .catch((error: AxiosError) => {
        throw error
      })
  }
}
