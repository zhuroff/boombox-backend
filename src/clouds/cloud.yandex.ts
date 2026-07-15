import { Cloud, CloudFolderContent, YandexCloudEntity, YandexCloudResponse, CLoudQueryPayload } from '../types/cloud'
import { HttpClient } from '../utils/http'
import CloudEntityViewFactory from '../views/CloudEntityViewFactory'

export default class YandexCloudApi implements Cloud {
  #client: HttpClient
  #domain = process.env['YCLOUD_DOMAIN']

  #qBuilder(path: string) {
    return `${this.#domain}${path}`
  }

  constructor() {
    this.#client = new HttpClient({
      Authorization: String(process.env['YCLOUD_OAUTH_TOKEN'])
    })
  }

  async getFolders(payload: CLoudQueryPayload) {
    const { path, limit = 100 } = payload

    if (typeof path !== 'string') {
      throw new Error('"path" is required and should be a string for Yandex Cloud API')
    }

    const query = this.#qBuilder(path)

    return await this.#client
      .get<YandexCloudResponse<YandexCloudEntity>>(`${query}&limit=${limit}`)
      .then(({ url, data }) => {
        if (!url) {
          throw new Error('"url" property is not found in cloud response')
        }

        return data._embedded.items.map((item) => CloudEntityViewFactory.create(item, url))
      })
      .catch((error: unknown) => {
        console.error(error)
        return []
      })
  }

  async getFolderContent(payload: CLoudQueryPayload): Promise<CloudFolderContent> {
    const { path, query = 'limit=100' } = payload

    if (typeof path !== 'string') {
      throw new Error('"path" is required and should be a string for Yandex Cloud API')
    }

    const q = this.#qBuilder(path)

    return await this.#client.get<YandexCloudResponse<YandexCloudEntity>>(`${q}&${query}`).then(({ url, data }) => {
      if (!url) {
        throw new Error('"url" property is not found in cloud response')
      }

      return {
        ...data._embedded,
        items: data._embedded.items.map((item) => CloudEntityViewFactory.create(item, url))
      }
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
      .catch((error: unknown) => {
        console.error(error)
        return undefined
      })
  }
}
