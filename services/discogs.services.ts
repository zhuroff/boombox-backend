import 'module-alias/register'
import { CloudLib } from '~/lib/cloud.lib'
import { DiscogsPayload } from '~/types/Album'

class DiscogsServices {
  async list({ artist, album, page }: DiscogsPayload) {
    const discogsUrl = `
      type=release
      &artist=${artist}
      &release_title=${album}
      &page=${page}
      &sort=released
      &per_page=100
    `
    const discogsQuery = CloudLib.discogsQueryLink(discogsUrl)
    const response = await CloudLib.get(encodeURI(discogsQuery))

    return response.data
  }

  async single(id: number) {
    const response = await CloudLib.get(encodeURI(CloudLib.discogsReleaseLink(id)))
    return response.data
  }
}

export default new DiscogsServices()
