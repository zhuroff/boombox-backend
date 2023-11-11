import { CloudLib } from '../lib/cloud.lib'
import { Cloud } from '../'
import { DiscogsPayload } from '../types/album.types'
import { DiscogsDTO } from '../dtos/discogs.dto'
// import { PaginationDTO } from '../dtos/pagination.dto'

class DiscogsServices {
  async getList({ artist, album, page }: DiscogsPayload, results: DiscogsDTO[] = []): Promise<DiscogsDTO[]> {
    const discogsUrl = String(
      'type=release' +
      '&artist=' + artist +
      '&release_title=' + album +
      '&sort=year&sort_order=asc&per_page=500' +
      '&page=' + page
    )
    const response = await Cloud.getDiscogsList(discogsUrl)

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

  async single(id: number) {
    const response = await CloudLib.get(encodeURI(CloudLib.discogsReleaseLink(id)))
    return response.data
  }
}

export default new DiscogsServices()
