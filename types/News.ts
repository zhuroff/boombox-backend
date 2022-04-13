type NewsItemResponseDate = {
  start: number
  end: number
}

type NewsItemResponseImage = {
  image: string
  source: {
    name: string
    link: string
  }
}

type NewsItemResponse = {
  id: number
  dates: NewsItemResponseDate[],
  title: string
  description: string
  price: string
  is_free: boolean
  images: NewsItemResponseImage[],
  site_url: string
}

type NewsResponse = {
  count: number
  results: NewsItemResponse[]
}

export {
  NewsItemResponseDate,
  NewsItemResponseImage,
  NewsItemResponse,
  NewsResponse
}
