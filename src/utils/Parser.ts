import { Request } from 'express'
import { ParsedQs } from 'qs'

export default class Parser {
  static isParsedQs(value: any): value is ParsedQs {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }

  static parseValue(value: string | ParsedQs | string[] | ParsedQs[]) {
    if (value === 'true') return true
    if (value === 'false') return false

    return typeof value === 'string' && value.trim() !== '' && !isNaN(Number(value))
      ? Number(value)
      : value
  }

  static parseTrackTitle(name: string) {
    return name
      .replace(/^[0-9]+[\.\s-]+/, '')
      .replace(/\.[^.]+$/, '')
      .trim()
  }

  static parseAlbumTitle(name: string) {
    const albumTitleRegExp = /\]\s*(.+?)\s*#/
    const albumTitle = albumTitleRegExp.exec(name)
    const albumTitleResult = albumTitle && albumTitle[1] ? albumTitle[1].trim() : 'unknown album'
    return albumTitleResult
  }

  static parseArtistName(name: string) {
    const albumArtist = name.split('\[')[0]
    const artistTitleResult = albumArtist ? albumArtist.trim() : 'unknown artist'
    return artistTitleResult
  }

  static parseAlbumGenre(name: string) {
    const albumGenre = name.split('#')[1]
    return albumGenre || 'unknown genre'
  }

  static getAlbumReleaseYear(name: string) {
    const albumYearRegExp = /\[([^)]+)\]/
    const albumYear = albumYearRegExp.exec(name)
    const albumYearResult = albumYear && albumYear[1] ? albumYear[1] : 'unknown year'
    return albumYearResult
  }

  static parseNestedQuery<T>(req: Request): T {
    const result: typeof req.query | Record<string, number | boolean> = {}
  
    for (const key in req.query) {
      const rawValue = req.query[key]

      if (!rawValue) continue

      const value = this.parseValue(rawValue)
  
      const parts = key.split('.')
      let current = result
  
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          current[part] = value
        } else {
          if (!this.isParsedQs(current[part])) {
            current[part] = {}
          }
          current = current[part]
        }
      })
    }
  
    return result as T
  }
}
