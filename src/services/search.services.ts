
import {
  SearchModel,
  SearchModelKey,
  SearchModelsSchema,
  SearchParams,
  SearchPayload,
  SearchResult
} from '../types/ReqRes'
import { AlbumDocument, AlbumResponse } from '../types/album.types'
import { CategoryDocument, CategoryResponse } from '../types/category.types'
import { TrackResponse } from '../types/Track'
import { Album } from '../models/album.model'
import { Embedded } from '../models/embedded.model'
import { Artist } from '../models/artist.model'
import { Genre } from '../models/genre.model'
import { Period } from '../models/period.model'
import { Collection } from '../models/collection.model'
import { Playlist } from '../models/playlist.model'
import { Track } from '../models/track.model'
import { Cloud } from '../'
import utils from '../utils'

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
      period: true,
      folderName: true
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
  },
  tracks: {
    instance: Track,
    title: 'Tracks',
    options: { _id: true, title: true, path: true, duration: true },
    populates: [
      { path: 'inAlbum', select: ['title', 'folderName'], populate: { path: 'period', model: Period, select: ['title'] } },
      { path: 'artist', select: ['title'] },
    ]
  }
}

class SearchServices {
  async search({ query, key }: SearchPayload) {
    const mappedResult = new Map<SearchModelKey, Partial<AlbumDocument | CategoryDocument>[]>()

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
        const cover = await Cloud.getFile(
          `${process.env['COLLECTION_ROOT']}/Collection/${utils.sanitizeURL(album.folderName)}/cover.webp`
        )
        if (cover) album.albumCover = cover
        return album
      })

      return await Promise.all(coveredAlbums)
    } else if (key === 'tracks') {
      const trackRes = await this.searchEntry<TrackResponse[]>(searchParams, searchSchema[key])
      const coveredTracks = trackRes.map(async (track) => {
        const cover = await Cloud.getFile(
          `${process.env['COLLECTION_ROOT']}/Collection/${utils.sanitizeURL(track.inAlbum.folderName)}/cover.webp`
        )
        if (cover) track.cover = cover
        return track
      })
      return await Promise.all(coveredTracks)
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
