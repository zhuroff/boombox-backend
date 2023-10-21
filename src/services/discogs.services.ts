import { CloudLib } from '../lib/cloud.lib'
import { Cloud } from '../'
import { DiscogsPayload } from '../types/album.types'
import { DiscogsDTO } from '../dtos/discogs.dto'
import { PaginationDTO } from '../dtos/pagination.dto'

class DiscogsServices {
  async getList({ artist, album, page }: DiscogsPayload) {
    const discogsUrl = String(
      'type=release' +
      '&artist=' + artist +
      '&release_title=' + album +
      '&sort=year&sort_order=asc&per_page=100' +
      '&page=' + page
    )
    const response = await Cloud.getDiscogsList(discogsUrl)
    return {
      pagination: new PaginationDTO(response.pagination),
      data: response.results.map((el) => new DiscogsDTO(el))
    }
  }

  async single(id: number) {
    const response = await CloudLib.get(encodeURI(CloudLib.discogsReleaseLink(id)))
    return response.data
  }
}

export default new DiscogsServices()
