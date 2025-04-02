import { DiscorsResponseItem } from '../types/discogs.types'

export default class DiscogsView {
  id: number
  country: string
  cover: string
  releaseFormat: string[]
  label: string[]
  masterApiUrl: string
  releaseApiUrl: string
  pageURL: string
  releaseTitle: string
  releaseYear: string

  constructor(item: DiscorsResponseItem) {
    this.id = item.id
    this.country = item.country
    this.cover = item.thumb
    this.releaseFormat = item.format
    this.label = [...new Set(item.label)].splice(0, 2)
    this.masterApiUrl = item.master_url
    this.releaseApiUrl = item.resource_url
    this.pageURL = `https://www.discogs.com${item.uri}`
    this.releaseTitle = item.title
    this.releaseYear = item.year
  }
}
