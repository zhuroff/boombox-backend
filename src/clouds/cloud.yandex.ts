import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { CloudExternalApi } from './cloud.external';
import { CloudEntityDTO } from '../dtos/cloud.dto';
import { CloudAPI, YandexCloudEntity, YandexCloudResponse } from '../types/Cloud';

export class YandexCloudApi extends CloudExternalApi implements CloudAPI {
  #domain = process.env['YCLOUD_DOMAIN']

  constructor() {
    super()
    this.client = axios.create({
      headers: { Authorization: String(process.env['YCLOUD_OAUTH_TOKEN']) }
    })
  }

  async getFolders(path: string, params?: AxiosRequestConfig) {
    return await this.client
      .get<YandexCloudResponse<YandexCloudEntity>>(
        `${this.#domain}/${path}`,
        params
      )
      .then(({ data }) => data._embedded.items.map((item) => new CloudEntityDTO(item)))
      .catch((error: AxiosError) => console.info('getFolders', error.message))
  }
  async getFolderContent(path: string) {
    return await this.client
      .get<YandexCloudResponse<YandexCloudEntity>>(`${this.#domain}${path}`)
      .then(({ data }) => {
        return {
          ...data._embedded,
          items: data._embedded.items.map((item) => new CloudEntityDTO(item))
        }
      })
      .catch((error: AxiosError) => console.info('getFolderContent', error.message))
  }

  async getFile(path: string) {
    return await this.client
      .get<YandexCloudResponse<YandexCloudEntity>>(`${this.#domain}${path}`)
      .then(({ data }) => data.file)
      .catch((error: AxiosError) => console.info('getFile', error.message))
  }
}
