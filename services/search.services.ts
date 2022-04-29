import { AlbumResponse } from '~/types/Album'
import { CategoryResponse } from '~/types/Category'
import { SearchModel, SearchModelKey, SearchModelsSchema, SearchParams, SearchPayload, SearchResult } from '~/types/ReqRes'
import { Album } from '~/models/album.model'
import { Frame } from '~/models/frame.model'
import { Artist } from '~/models/artist.model'
import { Genre } from '~/models/genre.model'
import { Period } from '~/models/period.model'
import { Collection } from '~/models/collection.model'
import { Playlist } from '~/models/playlist.model'
import { ApiError } from '~/exceptions/api-errors'
import { CloudLib } from '~/lib/cloud.lib'

class SearchServices {
  async search({ query, key }: SearchPayload) {
    const mappedResult = new Map<SearchModelKey, Partial<AlbumResponse | CategoryResponse>[]>()

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

    const result = Array.from(mappedResult).reduce((acc, next) => {
      if (next[1].length) {
        acc[next[0]] = {
          title: searchSchema[next[0]].title,
          data: next[1]
        }
      }
      
      return acc
    }, {} as SearchResult)

    return result
  }

  async searchSplitter({ query, key }: SearchPayload & { key: SearchModelKey }) {
    const searchParams = { $text: { $search: query } }

    if (key === 'albums') {
      return await CloudLib.covers(await this.searchEntry<Partial<AlbumResponse>[]>(searchParams, searchSchema[key]))
    } else {
      return await this.searchEntry<Partial<CategoryResponse>[]>(searchParams, searchSchema[key])
    }
  }

  async searchEntry<T>(params: SearchParams, model: SearchModel): Promise<T> {
    try {
      if (model?.instance) {
        return await model.instance
          .find(params, model.options)
          .populate(model.populates)
          .lean()
      } else {
        throw ApiError.BadRequest('Incorrect request options')
      }
    } catch (error) {
      throw ApiError.BadRequest('Incorrect request options')
    }
  }
}

const searchSchema: SearchModelsSchema = {
  albums: {
    instance: Album,
    title: 'Альбомы',
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

  frames: {
    instance: Frame,
    title: 'Фреймы',
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
    title: 'Артисты',
    options: { _id: true, title: true, avatar: true }
  },

  genres: {
    instance: Genre,
    title: 'Жанры',
    options: { _id: true, title: true, avatar: true }
  },

  periods: {
    instance: Period,
    title: 'Даты',
    options: { _id: true, title: true, avatar: true }
  },

  collections: {
    instance: Collection,
    title: 'Коллекции',
    options: { _id: true, title: true, avatar: true }
  },

  playlists: {
    instance: Playlist,
    title: 'Плейлисты',
    options: { _id: true, title: true, avatar: true }
  }
}

export default new SearchServices()
