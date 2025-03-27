import { AlbumDocument } from '../models/album.model'
import { TrackDocument } from '../models/track.model'
import { CategoryDocument, SearchRepository } from '../types/common.types'
import { SearchConfig, SearchParams, SearchPayload } from '../types/reqres.types'
import { TrackRepository } from '../types/track.types'
import { AlbumRepository } from '../types/album.types'
import { AlbumItemDTO } from '../dto/album.dto'

export default class SearchRepositoryContract implements SearchRepository {
  constructor(
    private albumRepository: AlbumRepository,
    private trackRepository: TrackRepository
  ) {}

  async splitSearch({ query, key }: SearchPayload, config?: SearchConfig) {
    if (!config) {
      throw new Error('Query config not found')
    }

    const searchParams = { $text: { $search: query } }

    if (key === 'albums') {
      const albumRes = await this.searchEntry<AlbumDocument[]>(searchParams, config)
      const coveredAlbums = await this.albumRepository.getCoveredAlbums(albumRes)
      return await Promise.all(coveredAlbums.map(({ album }) => new AlbumItemDTO(album)))
    } else if (key === 'tracks') {
      const trackRes = await this.searchEntry<TrackDocument[]>(searchParams, config)
      const coveredTracks = await this.trackRepository.getCoveredTracks(trackRes)
      return await Promise.all(coveredTracks)
    } else {
      return await this.searchEntry<CategoryDocument[]>(searchParams, config)
    }
  }

  async searchEntry<T>(params: SearchParams, Model: SearchConfig) {
    return await Model.instance
      .find(params, Model.options)
      // @ts-expect-error: type conflict
      .populate(Model.populates)
      .lean() as T
  }
}