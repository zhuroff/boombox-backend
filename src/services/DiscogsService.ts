import { Request } from 'express'
import { DiscogsRepository } from '../types/discogs'
import { DiscogsSearchView, DiscogsReleaseView } from '../views/DiscogsViews'
import Parser from '../utils/Parser'

export default class DiscogsService {
  constructor(private discogsRepository: DiscogsRepository) {}

  #buildCollectionQuery(subpath = '') {
    return encodeURI(
      process.env['DISCOGS_DOMAIN'] +
      '/users/' + process.env['DISCOGS_USERNAME'] +
      '/collection/folders' + subpath
    )
  }

  #buildSearchQuery(param: string) {
    return encodeURI(
      process.env['DISCOGS_DOMAIN'] +
      '/database/search?' + param +
      '&key=' + process.env['DISCOGS_KEY'] +
      '&secret=' + process.env['DISCOGS_SECRET']
    )
  }

  async getCollection(req: Request) {
    const parsedQuery = Parser.parseNestedQuery<{
      limit: number
      page: number
      folderName?: string
    }>(req)

    const folders = await this.discogsRepository.getCollectionFolders(
      this.#buildCollectionQuery(),
      parsedQuery.folderName
    )
    
    const content = await Promise.all(folders.map(async (folder) => {
      const query = String(
        '/' + folder.id +
        '/releases?sort=added&sort_order=desc' +
        '&page=' + parsedQuery.page +
        '&per_page=' + parsedQuery.limit
      )
      
      const releases = await this.discogsRepository.getCollectionContent(
        this.#buildCollectionQuery(query)
      )

      return releases
        ? new DiscogsReleaseView(folder, releases)
        : null
    }))

    return (
      content
        .filter((item) => item !== null)
        .sort((a, b) => b.count - a.count)
    )
  }

  async searchDiscogsData(req: Request, results: DiscogsSearchView[] = [], page = 1): Promise<DiscogsSearchView[]> {
    const parsedQuery = Parser.parseNestedQuery<{
      isMasterOnly?: 1 | 0
      artist: string
      album: string
      page: number
    }>(req)
    
    const query = String(
      `type=${parsedQuery.isMasterOnly ? 'master' : 'release'}` +
      '&artist=' + parsedQuery.artist +
      '&release_title=' + parsedQuery.album +
      '&sort=year&sort_order=asc&per_page=500' +
      '&page=' + (parsedQuery.page >= page ? parsedQuery.page : page)
    )

    const response = await this.discogsRepository.getDiscogsList(this.#buildSearchQuery(query))
    
    results.push(...(response?.results || []).reduce<DiscogsSearchView[]>((acc, next) => {
      const releaseAlbum = next.title.slice(next.title.indexOf(' - ') + 3)?.trim()
      if (
        releaseAlbum?.toLowerCase() === parsedQuery.album.toLowerCase()
        && !next.format.includes('Unofficial Release')
      ) acc.push(new DiscogsSearchView(next))
      return acc
    }, []))
    
    if (
      !parsedQuery.isMasterOnly
      && response?.pagination?.page
      && response.pagination.page < response.pagination.pages
    ) {
      return this.searchDiscogsData(req, results, page + 1)
    } else {
      return results
    }
  }
}
