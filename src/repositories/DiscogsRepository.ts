import axios from 'axios'
import { DiscogsFoldersResponse, DiscogsRepository, DiscogsReleasesResponse, DiscogsSearchResponse } from '../types/discogs'

export default class DiscogsRepositoryContract implements DiscogsRepository {
  #headers = {
    'User-Agent': 'Boombox/1.0 +https://example.com',
    'Accept': 'application/vnd.discogs.v2+json'
  }

  async getCollectionFolders(query: string, folderName?: string) {
    try {
      const response = await axios.get<DiscogsFoldersResponse | null>(query, {
        headers: {
          ...this.#headers,
          'Authorization': `Discogs token=${process.env['DISCOGS_ACCESS_TOKEN']}`
        }
      })

      return response?.data?.folders?.filter((folder) => (
        folder.id > 1 && (folderName ? folder.name === folderName : true)
      )) ?? []
    } catch(error) {
      console.error(error)
      return []
    }
  }

  async getCollectionContent(query: string) {
    try {
      const response = await axios.get<DiscogsReleasesResponse>(query, {
        headers: {
          ...this.#headers,
          'Authorization': `Discogs token=${process.env['DISCOGS_ACCESS_TOKEN']}`
        }
      })

      return response.data
    }
    catch(error) {
      console.error(error)
      return null
    }
  }

  async getDiscogsList(query: string) {
    try {
      const response = await axios.get<DiscogsSearchResponse>(query)
      return response.data
    } catch(_) {
      return {} as DiscogsSearchResponse
    }
  }
}
