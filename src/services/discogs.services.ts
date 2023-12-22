import axios, { AxiosError } from 'axios'
import { DiscogsDTO } from '../dto/discogs.dto'
import { DiscogsResponse, DiscogsPayload } from '../types/discogs.types'

export default {
  buildDiscogsLink(param: string) {
    return encodeURI(
      process.env['DISCOGS_DOMAIN'] +
      '/database/search?' + param +
      '&key=' + process.env['DISCOGS_KEY'] +
      '&secret=' + process.env['DISCOGS_SECRET']
    )
  },

  async getDiscogsList(query: string) {
    try {
      const response = await axios.get<DiscogsResponse>(this.buildDiscogsLink(query))
      return response.data
    } catch (error: unknown | AxiosError) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.message)
      }
      throw new Error('Unknown error')
    }
  },

  async getList({ artist, album, page }: DiscogsPayload, results: DiscogsDTO[] = []): Promise<DiscogsDTO[]> {
    const discogsUrl = String(
      'type=release' +
      '&artist=' + artist +
      '&release_title=' + album +
      '&sort=year&sort_order=asc&per_page=500' +
      '&page=' + page
    )
    const response = await this.getDiscogsList(discogsUrl)

    results.push(...response.results.reduce<DiscogsDTO[]>((acc, next) => {
      const releaseAlbum = next.title.slice(next.title.indexOf(' - ') + 3)?.trim()
      if (
        releaseAlbum?.toLowerCase() === album.toLowerCase()
        && !next.format.includes('Unofficial Release')
      ) acc.push(new DiscogsDTO(next))
      return acc
    }, []))
    
    if (response.pagination.page < response.pagination.pages) {
      return this.getList({ artist, album, page: response.pagination.page + 1 }, results)
    } else {
      return results
    }
  }
}
