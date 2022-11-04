import { NewsItemResponse, NewsItemResponseDate } from '../types/News'

export class NewsItemDTO {
  id: number
  dates: string
  title: string
  description: string
  price: string
  isFree: boolean
  imageUrl: string | undefined
  siteUrl: string

  #localizeDate(date: Date, isTime = false) {
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: isTime ? '2-digit' : undefined,
      minute: isTime ? '2-digit' : undefined
    })
  }

  #formatDates(dates: NewsItemResponseDate[]) {
    let stringDate = ''

    if (dates[0]) {
      if (dates[0].start === dates[0].end) {
        stringDate = this.#localizeDate(new Date(dates[0].start * 1000), true)
      } else {
        stringDate = `
          ${this.#localizeDate(new Date(dates[0].start * 1000))} - 
          ${this.#localizeDate(new Date(dates[0].end * 1000))}
        `
      }
    }

    if (dates.length > 1) {
      stringDate += ` + еще ${dates.length - 1}`
    }

    return stringDate
  }

  constructor(news: NewsItemResponse) {
    this.id = news.id
    this.dates = this.#formatDates(news.dates)
    this.title = news.title
    this.description = news.description
    this.price = news.price
    this.isFree = news.is_free
    this.imageUrl = news.images[0]?.image
    this.siteUrl = news.site_url
  }
}