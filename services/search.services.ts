import 'module-alias/register'
import { AlbumResponse } from '~/types/Album'
import { CategoryDocument } from '~/types/Category'
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
      return await CloudLib.covers(await this.searchEntry<Partial<AlbumResponse>[]>(searchParams, searchSchema[key]))
    } else {
      return await this.searchEntry<Partial<CategoryDocument>[]>(searchParams, searchSchema[key])
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

  frames: {
    instance: Frame,
    title: 'Frames',
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

export default new SearchServices()
