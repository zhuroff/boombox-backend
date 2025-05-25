import { DiscogsPayload, DiscogsRepository } from '../types/discogs.types'
import DiscogsView from '../views/DiscogsView'

export default class DiscogsService {
  constructor(private discogsRepository: DiscogsRepository) {}

  #buildDiscogsLink(param: string) {
    return encodeURI(
      process.env['DISCOGS_DOMAIN'] +
      '/database/search?' + param +
      '&key=' + process.env['DISCOGS_KEY'] +
      '&secret=' + process.env['DISCOGS_SECRET']
    )
  }

  async getDiscogsData({ artist, album, page, isMasterOnly }: DiscogsPayload, results: DiscogsView[] = []): Promise<DiscogsView[]> {
    const query = String(
      `type=${isMasterOnly ? 'master' : 'release'}` +
      '&artist=' + artist +
      '&release_title=' + album +
      '&sort=year&sort_order=asc&per_page=500' +
      '&page=' + page
    )

    const response = await this.discogsRepository.getDiscogsList(this.#buildDiscogsLink(query))

    results.push(...(response.results || []).reduce<DiscogsView[]>((acc, next) => {
      const releaseAlbum = next.title.slice(next.title.indexOf(' - ') + 3)?.trim()
      if (
        releaseAlbum?.toLowerCase() === album.toLowerCase()
        && !next.format.includes('Unofficial Release')
      ) acc.push(new DiscogsView(next))
      return acc
    }, []))
    
    if (
      !isMasterOnly
      && response.pagination?.page
      && response.pagination.page < response.pagination.pages
    ) {
      return this.getDiscogsData({ artist, album, page: response.pagination.page + 1 }, results)
    } else {
      return results
    }
  }
}
