import axios, {AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { CloudEntityDTO } from '../dto/cloud.dto';
import { Cloud, CloudFileTypes, YandexCloudEntity, YandexCloudResponse } from '../types/cloud.types';

export class YandexCloudApi implements Cloud {
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
    return await this.#client
      .get<YandexCloudResponse<YandexCloudEntity>>(this.#qBuilder(path), params)
      .then(({ config: { url }, data }) => {
        if (!url) {
          throw new Error('"url" property is not found in cloud response')
        }
        return data._embedded.items.map((item) => new CloudEntityDTO(item, url))
      })
      .catch((error: AxiosError) => {
        console.error(error)
        throw error
      })
  }
  
  async getFolderContent(path: string, root?: string) {
    return await this.#client
      .get<YandexCloudResponse<YandexCloudEntity>>(this.#qBuilder(path, root))
      .then(({ config: { url }, data }) => {
        if (!url) {
          throw new Error('"url" property is not found in cloud response')
        }
        return {
          ...data._embedded,
          items: data._embedded.items.map((item) => new CloudEntityDTO(item, url, root))
        }
      })
      .catch((error: AxiosError) => {
        console.error(error)
        throw error
      })
  }

  async getFile(path: string, fileType: CloudFileTypes, root?: string) {
    return await this.#client
      .get<YandexCloudResponse<YandexCloudEntity>>(this.#qBuilder(path, root))
      .then(({ data }) => data.file)
      .catch((error: AxiosError) => {
        console.error(error)
        throw error
      })
  }
}
