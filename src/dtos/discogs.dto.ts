import { DiscorsResponseItem } from "src/types/discogs.types"

export class DiscogsDTO {
  id: number
  country: string
  cover: string
  format: string[]
  genre: string[]
  style: string[]
  label: string[]
  masterApiUrl: string
  releaseApiUrl: string
  pageURL: string
  title: string
  year: string

  constructor(item: DiscorsResponseItem) {
    this.id = item.id
    this.country = item.country
    this.cover = item.cover_image
    this.format = item.format
    this.genre = item.genre
    this.style = item.style
    this.label = item.label
    this.masterApiUrl = item.master_url
    this.releaseApiUrl = item.resource_url
    this.pageURL = `https://www.discogs.com${item.uri}`
    this.title = item.title
    this.year = item.year
  }
}
