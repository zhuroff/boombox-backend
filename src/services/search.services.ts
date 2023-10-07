import { AlbumResponse } from '../types/album.types'
import { CategoryDocument, CategoryResponse } from '../types/Category'
import { SearchModel, SearchModelKey, SearchModelsSchema, SearchParams, SearchPayload, SearchResult } from '../types/ReqRes'
import { Album } from '../models/album.model'
import { Embedded } from '../models/embedded.model'
import { Artist } from '../models/artist.model'
import { Genre } from '../models/genre.model'
import { Period } from '../models/period.model'
import { Collection } from '../models/collection.model'
import { Playlist } from '../models/playlist.model'
import { CloudLib } from '../lib/cloud.lib'
import { CloudFile } from '../types/Cloud'

const searchSchema: SearchModelsSchema = {
  albums: {
    instance: Album,
    title: 'Albums',
    options: {
      _id: true,
      title: true,
      artist: true,
      genre: true,
      albumCover: true,
      period: true
    },
    populates: [
      { path: 'artist', select: ['title'] },
      { path: 'genre', select: ['title'] },
      { path: 'period', select: ['title'] }
    ]
  },

  embedded: {
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
  },

  artists: {
    instance: Artist,
    title: 'Artists',
    options: { _id: true, title: true, avatar: true }
  },

  genres: {
    instance: Genre,
    title: 'Genres',
    options: { _id: true, title: true, avatar: true }
  },

  periods: {
    instance: Period,
    title: 'Years',
    options: { _id: true, title: true, avatar: true }
  },

  collections: {
    instance: Collection,
    title: 'Collections',
    options: { _id: true, title: true, avatar: true }
  },

  playlists: {
    instance: Playlist,
    title: 'Playlists',
    options: { _id: true, title: true, avatar: true }
  }
}

class SearchServices {
  async search({ query, key }: SearchPayload) {
    const mappedResult = new Map<SearchModelKey, Partial<AlbumResponse | CategoryDocument>[]>()

    if (key) {
      mappedResult.set(key, await this.searchSplitter({ query, key }))
    } else {
      await Promise.all(
        Object.keys(searchSchema)
          .map(async (k) => (
            mappedResult.set(
              k as SearchModelKey,
              await this.searchSplitter({ query, key: k as SearchModelKey })
            )
          ))
      )
    }

    return Array.from(mappedResult).reduce<SearchResult[]>((acc, next) => {
      if (next[1].length) {
        acc.push({
          title: searchSchema[next[0]].title,
          key: next[0],
          data: next[1]
        })
      }

      return acc
    }, [])
  }

  async searchSplitter({ query, key }: SearchPayload & { key: SearchModelKey }) {
    const searchParams = { $text: { $search: query } }

    if (key === 'albums') {
      const albumRes = await this.searchEntry<AlbumResponse[]>(searchParams, searchSchema[key])
      const coveredAlbums = albumRes.map(async (album) => {
        const albumCoverRes = await CloudLib.get<CloudFile>(album.albumCover)
        album.albumCover = albumCoverRes.data.file
        return album
      })

      return await Promise.all(coveredAlbums)
    } else {
      return await this.searchEntry<CategoryResponse[]>(searchParams, searchSchema[key])
    }
  }

  async searchEntry<T>(params: SearchParams, model: SearchModel): Promise<T> {
    try {
      if (model?.instance) {
        return await model.instance
          .find(params, model.options)
          // @ts-ignore
          .populate(model.populates)
          .lean()
      } else {
        throw new Error('Incorrect request options')
      }
    } catch (error) {
      throw new Error('Incorrect request options')
    }
  }
}

export default new SearchServices()
