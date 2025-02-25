import axios, {AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios'
import { Cloud, CloudFileTypes, CloudFolderContent, YandexCloudEntity, YandexCloudResponse } from '../types/cloud.types'
import CloudEntityFactoryDTO from '../dto/cloud.dto'

export default class YandexCloudApi implements Cloud {
  #client: AxiosInstance
  #domain = process.env['YCLOUD_DOMAIN']
  #cloudRootPath: string
  #qBuilder(path: string, root? :string) {
    return `${this.#domain}${this.#cloudRootPath}/${root || 'Collection'}/${path}`
  }

  constructor(cloudRootPath: string) {
    this.#cloudRootPath = cloudRootPath
    this.#client = axios.create({
      headers: { Authorization: String(process.env['YCLOUD_OAUTH_TOKEN']) }
    })
  }

  async getFolders(path: string, params?: AxiosRequestConfig) {
    const query = this.#qBuilder(path)

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
        console.error(error)
        throw error
      })
  }
  
  async getFolderContent(path: string, root?: string): Promise<CloudFolderContent> {
    const query = this.#qBuilder(path, root)

    return await this.#client
      .get<YandexCloudResponse<YandexCloudEntity>>(query)
      .then(({ config: { url }, data }) => {
        if (!url) {
          throw new Error('"url" property is not found in cloud response')
        }

        return {
          ...data._embedded,
          items: data._embedded.items.map((item) => (
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
    const query = this.#qBuilder(path, root)

    return await this.#client
      .get<YandexCloudResponse<YandexCloudEntity>>(query)
      .then(({ data }) => data.file)
      .catch((error: AxiosError) => {
        console.error(error)
        throw error
      })
  }
}
