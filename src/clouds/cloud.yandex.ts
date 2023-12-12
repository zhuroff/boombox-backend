import axios, {AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { CloudEntityDTO } from '../dtos/cloud.dto';
import { Cloud, YandexCloudEntity, YandexCloudResponse } from '../types/Cloud';

export class YandexCloudApi implements Cloud {
  #client: AxiosInstance
  #domain = process.env['YCLOUD_DOMAIN']
  #cloudRootPath: string
  #qBuilder(path: string) {
    return `${this.#domain}${this.#cloudRootPath}/${path}`
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
        console.error('getFolders', error.message)
        return null
      })
  }
  
  async getFolderContent(path: string) {
    return await this.#client
      .get<YandexCloudResponse<YandexCloudEntity>>(this.#qBuilder(path))
      .then(({ config: { url }, data }) => {
        if (!url) {
          throw new Error('"url" property is not found in cloud response')
        }
        return {
          ...data._embedded,
          items: data._embedded.items.map((item) => new CloudEntityDTO(item, url))
        }
      })
      .catch((error: AxiosError) => console.error('getFolderContent', error.message))
  }

  async getFile(path: string) {
    return await this.#client
      .get<YandexCloudResponse<YandexCloudEntity>>(this.#qBuilder(path))
      .then(({ data }) => data.file)
      .catch((error: AxiosError) => console.error('getFile', error.message))
  }
}
