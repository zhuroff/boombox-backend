import TrackViewFactory from './TrackViewFactory'

export default class TOYView {
  _id: string
  kind = 'album'
  title: string
  artist = { title: 'Various Artists' }
  genre: { title: string }
  period: { title: string }
  tracks: ReturnType<typeof TrackViewFactory.create>[]
  coverURL?: string
  metadataContent?: Record<string, string>[] | null

  constructor(
    genre: string,
    year: string,
    tracks: ReturnType<typeof TrackViewFactory.create>[],
    coverURL?: string,
    metadataContent?: Record<string, string>[] | null
  ) {
    this._id = `${genre}-${year}`
    this.title = `TOY: ${genre}, ${year}`
    this.genre = { title: genre }
    this.period = { title: year }
    this.tracks = tracks
    
    if (coverURL) {
      this.coverURL = coverURL
    }

    if (metadataContent) {
      this.metadataContent = metadataContent
    }
  }
}
