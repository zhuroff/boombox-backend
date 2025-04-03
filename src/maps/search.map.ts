import { SearchConfig, SearchModelKey } from '../types/reqres.types'
import { Album } from '../models/album.model'
import { Embedded } from '../models/embedded.model'
import { Artist } from '../models/artist.model'
import { Genre } from '../models/genre.model'
import { Period } from '../models/period.model'
import { Collection } from '../models/collection.model'
import { Compilation } from '../models/compilation.model'
import { Track } from '../models/track.model'

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

export default searchMap
