
import { SearchConfig, SearchModelKey, SearchParams, SearchPayload, SearchResult } from '../types/reqres.types'
import { Album, AlbumDocument } from '../models/album.model'
import { Embedded } from '../models/embedded.model'
import { Artist } from '../models/artist.model'
import { Genre } from '../models/genre.model'
import { Period } from '../models/period.model'
import { Collection } from '../models/collection.model'
import { Compilation } from '../models/compilation.model'
import { Track, TrackDocument } from '../models/track.model'
import { CategoryDocument } from '../types/common.types'
import albumsServices from './albums.services'
import tracksServices from './tracks.services'
import { AlbumItemDTO } from 'src/dto/album.dto'

const searchMap = new Map<SearchModelKey, SearchConfig>([
  [
    'albums',
    {
      instance: Album,
      options: {
        _id: true,
        title: true,
        artist: true,
        genre: true,
        albumCover: true,
        period: true,
        folderName: true,
        cloudURL: true
      },
      populates: [
        { path: 'artist', select: ['title'] },
        { path: 'genre', select: ['title'] },
        { path: 'period', select: ['title'] }
      ]
    }
  ],
  [
    'embedded',
    {
      instance: Embedded,
      options: {
        _id: true,
        title: true,
        artist: true,
        genre: true,
        period: true
      },
      populates: [
        { path: 'artist', select: ['title'] },
        { path: 'genre', select: ['title'] },
        { path: 'period', select: ['title'] }
      ]
    }
  ],
  [
    'artists',
    {
      instance: Artist,
      options: { _id: true, title: true, avatar: true }
    }
  ],
  [
    'genres',
    {
      instance: Genre,
      options: { _id: true, title: true, avatar: true }
    }
  ],
  [
    'periods',
    {
      instance: Period,
      options: { _id: true, title: true, avatar: true }
    }
  ],
  [
    'collections',
    {
      instance: Collection,
      options: { _id: true, title: true, avatar: true }
    }
  ],
  [
    'compilations',
    {
      instance: Compilation,
      options: { _id: true, title: true, avatar: true }
    }
  ],
  [
    'tracks',
    {
      instance: Track,
      options: { _id: true, title: true, path: true, duration: true, cloudURL: true },
      populates: [
        { path: 'inAlbum', select: ['title', 'folderName', 'cloudURL'], populate: { path: 'period', model: Period, select: ['title'] } },
        { path: 'artist', select: ['title'] },
      ]
    }
  ]
])

export default {
  async search(payload: SearchPayload) {
    const mappedResult = new Map<SearchModelKey, Partial<AlbumItemDTO | TrackDocument | CategoryDocument>[]>()

    try {
      if (payload.key) {
        mappedResult.set(
          payload.key,
          await this.searchSplitter(payload, searchMap.get(payload.key))
        )
      } else {
        await Promise.all([...searchMap].map(async ([key, config]) => (
          mappedResult.set(key, await this.searchSplitter({ query: payload.query, key }, config))
        )))
      }
  
      return [...mappedResult].reduce<SearchResult[]>((acc, [key, data]) => {
        if (data?.length) acc.push({ key, data })
        return acc
      }, [])
    } catch (error) {
      throw error
    }
  },
  async searchSplitter({ query, key }: SearchPayload, config?: SearchConfig) {
    if (!config) {
      throw new Error('Query config not found')
    }

    const searchParams = { $text: { $search: query } }

    try {
      if (key === 'albums') {
        const albumRes = await this.searchEntry<AlbumDocument[]>(searchParams, config)
        const coveredAlbums = await albumsServices.getCoveredAlbums(albumRes)
        return await Promise.all(coveredAlbums)
      } else if (key === 'tracks') {
        const trackRes = await this.searchEntry<TrackDocument[]>(searchParams, config)
        const coveredTracks = await tracksServices.getCoveredTracks(trackRes)
        return await Promise.all(coveredTracks)
      } else {
        return await this.searchEntry<CategoryDocument[]>(searchParams, config)
      }
    } catch (error) {
      throw error
    }
  },
  async searchEntry<T>(params: SearchParams, model: SearchConfig): Promise<T> {
    try {
      return await model.instance
        .find(params, model.options)
        // @ts-ignore
        .populate(model.populates)
        .lean()
    } catch (error) {
      throw error
    }
  }
}
