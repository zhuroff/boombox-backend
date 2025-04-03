export default class Validator {
  static isAlbumFolderNameValid(name: string) {
    const pattern = /^[^\[]+ \[(\d{4})\] [^\#]+ #\S.*$/
    return pattern.test(name)
  }

  static isTrackFilenameValid(name: string) {
    const pattern = /^\d+\.\s.*\.(mp3|flac|ogg|aac|aiff|ape|mqa|wav|wma|alac)$/
    return pattern.test(name)
  }
}
