import axios, { AxiosError } from 'axios'
import { DiscogsResponse } from '../types/discogs.types'

export class CloudExternalApi {
  protected client = axios.create({})

  #buildDiscogsLink(param: string) {
    return encodeURI(
      process.env['DISCOGS_DOMAIN'] +
      '/database/search?' + param +
      '&key=' + process.env['DISCOGS_KEY'] +
      '&secret=' + process.env['DISCOGS_SECRET']
    )
  }
  async getDiscogsList(query: string) {
    try {
      const response = await this.client.get<DiscogsResponse>(this.#buildDiscogsLink(query))
      return response.data
    } catch (error: unknown | AxiosError) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.message)
      }
      throw new Error('Unknown error')
    }
  }
}
