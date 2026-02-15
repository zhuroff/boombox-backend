import { DiscogsFolderItem, DiscogsReleasesResponse, DiscogsResponseItem, DiscogsResponsePagination } from '../types/discogs'

export class DiscogsSearchView {
  id: number
  country: string
  cover: string
  releaseFormat: string[]
  label: string[]
  pageURL: string
  releaseTitle: string
  releaseYear: string

  constructor(item: DiscogsResponseItem) {
    this.id = item.id
    this.country = item.country
    this.cover = item.thumb
    this.releaseFormat = item.format
    this.label = [...new Set(item.label)].splice(0, 2)
    this.pageURL = `https://www.discogs.com${item.uri}`
    this.releaseTitle = item.title
    this.releaseYear = item.year
  }
}

export class DiscogsReleaseView {
  id: number
  name: string
  count: number
  releases: Record<string, unknown>[]
  pagination: DiscogsResponsePagination | undefined

  constructor(folder: DiscogsFolderItem, releases: DiscogsReleasesResponse) {
    this.id = folder.id
    this.name = folder.name
    this.count = folder.count
    this.pagination = releases.pagination
    this.releases = releases.releases.map((release) => ({
      ...release.basic_information,
      date_added: release.date_added,
      melodymap_link: release.notes?.map((note) => note.value).join(';') || null,
      release_url: `https://www.discogs.com/release/${release.id}`
    }))
  }
}
