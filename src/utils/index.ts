import { createHash } from 'node:crypto'
import { CloudEntityDTO } from 'src/dtos/cloud.dto'

export default {
  sanitizeURL: (path: string, subPath = '') => (
    encodeURIComponent(
      path
        .replace(/(disk:\/|\/)/, '')
        .replace(subPath, '')
    )
  ),

  sha1: (str?: string) => (
    str ? createHash('sha1').update(str).digest('hex') : ''
  ),

  toCamelCase: (str: string) => (
    str.split(/[-\.\s]/gi).reduce((acc, next, index) => (
      acc += index === 0 ? next : `${next.charAt(0).toUpperCase()}${next.slice(1)}`
    ), '')
  ),

  isAlbumFolderNameValid: (name: string) => {
    const pattern = /^[^\[]+ \[(\d{4})\] [^\#]+ #\S.*$/
    return pattern.test(name)
  },

  fileFilter: (data: CloudEntityDTO[], types: Set<string>): Required<CloudEntityDTO>[] => (
    data.reduce<Required<CloudEntityDTO>[]>((acc, next) => {
      if (next.mimeType && types.has(next.mimeType)) {
        acc.push(next as Required<CloudEntityDTO>)
      }
      return acc
    }, [])
  ),

  parseTrackTitle: (name: string) => {
    return name
      .replace(/^[0-9]+(.\s|-)+/, '')
      .replace(/\.[^.]+$/, '')
      .trim()
  },

  parseAlbumTitle: (name: string) => {
    const albumTitleRegExp = /\]\s*(.+?)\s*#/
    const albumTitle = albumTitleRegExp.exec(name)
    const albumTitleResult = albumTitle && albumTitle[1] ? albumTitle[1].trim() : 'unknown album'
    return albumTitleResult
  },

  parseArtistName: (name: string) => {
    const albumArtist = name.split('\[')[0]
    const artistTitleResult = albumArtist ? albumArtist.trim() : 'unknown artist'
    return artistTitleResult
  },

  parseAlbumGenre: (name: string) => {
    const albumGenre = name.split('#')[1]
    return albumGenre || 'unknown genre'
  },

  getAlbumReleaseYear: (name: string) => {
    const albumYearRegExp = /\[([^)]+)\]/
    const albumYear = albumYearRegExp.exec(name)
    const albumYearResult = albumYear && albumYear[1] ? albumYear[1] : 'unknown year'
    return albumYearResult
  },

  audioMimeTypes: new Set([
    'audio/aac',
    'audio/x-aac',
    'audio/aiff',
    'audio/x-aiff',
    'audio/flac',
    'audio/x-flac',
    'audio/mp3',
    'audio/x-mp3',
    'audio/mpeg3',
    'audio/x-mpeg-3',
    'audio/x-mpegurl',
    'audio/mp4',
    'audio/mpeg',
    'audio/ogg',
    'audio/wav',
    'audio/x-wav',
    'audio/webm',
    'audio/x-ms-wma',
    'application/ogg'
  ]),

  imagesMimeTypes: new Set([
    'image/apng',
    'image/avif',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'image/webp',
    'application/octet-stream'
  ])
}
