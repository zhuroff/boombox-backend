import { DiscogsPayload, DiscogsRepository } from '../types/discogs.types'
import { DiscogsDTO } from '../dto/discogs.dto'

export default class DiscogsService {
  constructor(private discogsRepository: DiscogsRepository) {}

  private buildDiscogsLink(param: string) {
    return encodeURI(
      process.env['DISCOGS_DOMAIN'] +
      '/database/search?' + param +
      '&key=' + process.env['DISCOGS_KEY'] +
      '&secret=' + process.env['DISCOGS_SECRET']
    )
  }

  async getDiscogsData({ artist, album, page }: DiscogsPayload, results: DiscogsDTO[] = []): Promise<DiscogsDTO[]> {
    const query = String(
      'type=release' +
      '&artist=' + artist +
      '&release_title=' + album +
      '&sort=year&sort_order=asc&per_page=500' +
      '&page=' + page
    )

    const response = await this.discogsRepository.getDiscogsList(this.buildDiscogsLink(query))

    results.push(...response.results.reduce<DiscogsDTO[]>((acc, next) => {
      const releaseAlbum = next.title.slice(next.title.indexOf(' - ') + 3)?.trim()
      if (
        releaseAlbum?.toLowerCase() === album.toLowerCase()
        && !next.format.includes('Unofficial Release')
      ) acc.push(new DiscogsDTO(next))
      return acc
    }, []))
    
    if (response.pagination.page < response.pagination.pages) {
      return this.getDiscogsData({ artist, album, page: response.pagination.page + 1 }, results)
    } else {
      return results
    }
  }
}
