import 'module-alias/register'
import { AxiosRequestConfig } from 'axios'
// import { TrackResponse } from '~/types/Track'
// import { TrackDTO } from '~/dtos/track.dto'
import { cloudApi } from '..'

export class CloudLib {
  static cloudQueryLink(param: string) {
    return `${process.env['CLOUD_DOMAIN']}/${param}&username=${process.env['CLOUD_LOGIN']}&password=${process.env['CLOUD_PASSWORD']}`
  }

  static discogsQueryLink(param: string) {
    return `${process.env['DISCOGS_DOMAIN']}/database/search?${param}&key=${process.env['DISCOGS_KEY']}&secret=${process.env['DISCOGS_SECRET']}`
  }

  static discogsReleaseLink(id: number) {
    return `${process.env['DISCOGS_DOMAIN']}/releases/${id}?key=${process.env['DISCOGS_KEY']}&secret=${process.env['DISCOGS_SECRET']}`
  }

  static async get<T>(
    query: string,
    params: AxiosRequestConfig = { params: { limit: 5000 } },
    domain: string = String(process.env['CLOUD_DOMAIN'])
  ) {
    try {
      const response = await cloudApi.get<T>(`${domain}/${query}`, params)
      return response
    } catch (error) {
      throw error
    }
  }
}
