import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { AlbumModel } from '~/types/Album'
import { TrackModel } from '~/types/Track'

export class CloudLib {
  static cloudQueryLink(param: string) {
    return `${process.env['CLOUD_DOMAIN']}/${param}&username=${process.env['CLOUD_LOGIN']}&password=${process.env['CLOUD_PASSWORD']}`
  }

  static discogsQueryLink(param: string) {
    return `${process.env['DISCOGS_DOMAIN']}/database/search?${param}&key=${process.env['DISCOGS_KEY']}&secret=${process.env['DISCOGS_SECRET']}`
  }

  static async getImageLink(id: number) {
    const query = this.cloudQueryLink(`getfilelink?fileid=${id}`)
    const response = await this.getData(query)
    return response.data.error ? 0 : `https://${response.data.hosts[0]}${response.data.path}`
  }

  static async covers<T extends Partial<AlbumModel>>(items: T[]): Promise<T[]> {
    const result = items.map(async (item) => ({
      ...item,
      albumCover: await this.getImageLink(Number(item.albumCover))
    }))

    return await Promise.all(result)
  }

  static async tracks(tracks: TrackModel[]) {
    const result = tracks.map(async (el) => {
      const query = this.cloudQueryLink(`getfilelink?fileid=${el.fileid}`)
      const track = await this.getData(query)
  
      el.link = `https://${track.data.hosts[0]}${track.data.path}`
      return el
    })
  
    return await Promise.all(result)
  }

  static async getData(query: string, params?: AxiosRequestConfig): Promise<AxiosResponse> {
    try {
      const response = await axios.get(query, params)
      return response
    } catch (error) {
      throw error
    }
  }
}