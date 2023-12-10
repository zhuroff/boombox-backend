
import { SearchConfig, SearchModelKey, SearchParams, SearchPayload, SearchResult } from '../types/ReqRes'
import { CategoryDocument, CategoryResponse } from '../types/category.types'
import { AlbumDocument, AlbumResponse } from '../types/album.types'
import { TrackResponse } from '../types/Track'
import { Album } from '../models/album.model'
import { Embedded } from '../models/embedded.model'
import { Artist } from '../models/artist.model'
import { Genre } from '../models/genre.model'
import { Period } from '../models/period.model'
import { Collection } from '../models/collection.model'
import { Playlist } from '../models/playlist.model'
import { Track } from '../models/track.model'
import albumsServices from './albums.services'
import tracksServices from './tracks.services'

const searchMap = new Map<SearchModelKey, SearchConfig>([
  [
    'albums',
    {
      instance: Album,
      title: 'Albums',
      options: {
        _id: true,
        title: true,
        artist: true,
        genre: true,
        albumCover: true,
        period: true,
        folderName: true
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
      title: 'Embedded',
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
      title: 'Artists',
      options: { _id: true, title: true, avatar: true }
    }
  ],
  [
    'genres',
    {
      instance: Genre,
      title: 'Genres',
      options: { _id: true, title: true, avatar: true }
    }
  ],
  [
    'periods',
    {
      instance: Period,
      title: 'Years',
      options: { _id: true, title: true, avatar: true }
    }
  ],
  [
    'collections',
    {
      instance: Collection,
      title: 'Collections',
      options: { _id: true, title: true, avatar: true }
    }
  ],
  [
    'playlists',
    {
      instance: Playlist,
      title: 'Playlists',
      options: { _id: true, title: true, avatar: true }
    }
  ],
  [
    'tracks',
    {
      instance: Track,
      title: 'Tracks',
      options: { _id: true, title: true, path: true, duration: true },
      populates: [
        { path: 'inAlbum', select: ['title', 'folderName'], populate: { path: 'period', model: Period, select: ['title'] } },
        { path: 'artist', select: ['title'] },
      ]
    }
  ]
])

class SearchServices {
  async search(payload: SearchPayload) {
    const mappedResult = new Map<SearchModelKey, Partial<AlbumDocument | CategoryDocument>[]>()

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
  }

  async searchSplitter({ query, key }: SearchPayload, config?: SearchConfig) {
    if (!config) {
      throw new Error('Query config not found')
    }

    const searchParams = { $text: { $search: query } }

    if (key === 'albums') {
      const albumRes = await this.searchEntry<AlbumResponse[]>(searchParams, config)
      const coveredAlbums = await albumsServices.getCoveredAlbums(albumRes)
      return await Promise.all(coveredAlbums)
    } else if (key === 'tracks') {
      const trackRes = await this.searchEntry<TrackResponse[]>(searchParams, config)
      const coveredTracks = await tracksServices.getCoveredTracks(trackRes)
      return await Promise.all(coveredTracks)
    } else {
      return await this.searchEntry<CategoryResponse[]>(searchParams, config)
    }
  }

  async searchEntry<T>(params: SearchParams, model: SearchConfig): Promise<T> {
    try {
      return await model.instance
        .find(params, model.options)
        // @ts-ignore
        .populate(model.populates)
        .lean()
    } catch (error) {
      throw new Error('Incorrect request options')
    }
  }
}

export default new SearchServices()
