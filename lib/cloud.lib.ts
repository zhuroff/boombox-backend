import 'module-alias/register'
import { AxiosRequestConfig } from 'axios'
import { AlbumResponse } from '~/types/Album'
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

  static async getImageLink(id: number) {
    const query = this.cloudQueryLink(`getfilelink?fileid=${id}`)
    const response = await this.get<any>(query)
    return response.data.error ? '' : `https://${response.data.hosts[0]}${response.data.path}`
  }

  static async covers<T extends Partial<AlbumResponse>>(items: T[]): Promise<T[]> {
    const result = items.map(async (item) => ({
      ...item,
      albumCover: await this.getImageLink(Number(item.albumCover))
    }))

    return await Promise.all(result)
  }

  // static async tracks(tracks: TrackResponse[]) {
  //   const result = tracks.map(async (el) => {
  //     const query = this.cloudQueryLink(`getfilelink?fileid=${el._id}`)
  //     const track = await this.get<any>(query)

  //     const payload = { ...el, link: `https://${track.data.hosts[0]}${track.data.path}` }
  //     const result = new TrackDTO(payload)
  //     return result
  //   })

  //   return await Promise.all(result)
  // }

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
