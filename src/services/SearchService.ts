import { TrackDocument } from '../models/track.model'
import { AlbumItem } from '../types/album.types'
import { SearchRepository, SearchConfig, SearchModelKey, SearchPayload, SearchResult } from '../types/search.types'
import { CategoryDocument } from '../types/category.types'

export default class SearchService {
  constructor(
    private searchMap: Map<SearchModelKey, SearchConfig>,
    private searchRepository: SearchRepository
  ) {}

  async search(payload: SearchPayload) {
    const mappedResult = new Map<
      SearchModelKey,
      Partial<TrackDocument | CategoryDocument | AlbumItem>[]
    >()

    if (payload.key) {
      const response = await this.searchRepository.splitSearch(payload, this.searchMap.get(payload.key))

      mappedResult.set(payload.key, response)
    } else {
      await Promise.all([...this.searchMap].map(async ([key, config]) => (
        mappedResult.set(key, await this.searchRepository.splitSearch({ query: payload.query, key }, config))
      )))
    }

    return [...mappedResult].reduce<SearchResult[]>((acc, [key, data]) => {
      if (data?.length) acc.push({ key, data })
      return acc
    }, [])
  }
}