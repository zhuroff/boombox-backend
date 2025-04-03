export default class Parser {
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
}
