import axios from 'axios'
import { DiscogsRepository, DiscogsResponse } from '../types/discogs'

export default class DiscogsRepositoryContract implements DiscogsRepository {
  async getDiscogsList(query: string) {
    try {
      const response = await axios.get<DiscogsResponse>(query)
      return response.data
    } catch(_) {
      return {} as DiscogsResponse
    }
  }
}
