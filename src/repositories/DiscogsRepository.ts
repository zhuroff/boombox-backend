import axios from 'axios'
import { DiscogsRepository, DiscogsResponse } from '../types/discogs.types'

export default class DiscogsRepositoryContract implements DiscogsRepository {
  async getDiscogsList(query: string) {
    const response = await axios.get<DiscogsResponse>(query)
    return response.data
  }
}
