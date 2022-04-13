import { ApiError } from '~/exceptions/api-errors'
import { CloudLib } from '~/lib/cloud.lib'
import { PaginationDTO } from '~/dtos/pagination.dto'
import { NewsItemDTO } from '~/dtos/news.dto'
import { NewsResponse } from '~/types/News'
import { AxiosResponse } from 'axios'

class NewsServices {
  async list(page: number, limit: number) {
    const params = {
      page_size: limit,
      location: 'spb',
      text_format: 'text',
      page,
      categories: 'concert',
      actual_since: new Date().toISOString(),
      fields: 'id,title,dates,description,is_free,images,site_url,price',
    }

    const response: AxiosResponse<NewsResponse> = await CloudLib.get('https://kudago.com/public-api/v1.4/events/', { params })

    if (response?.status === 200) {
      const paginationPayload = {
        totalDocs: response.data.count,
        totalPages: Math.ceil(response.data.count / limit),
        page
      }

      const docs = response.data.results
        .sort((a, b) => {
          if (a.dates[0] && b.dates[0]) {
            if (a.dates[0].end < b.dates[0].end) return -1
            if (a.dates[0].end > b.dates[0].end) return 1
            return 0
          }

          return 0
        })
        .map((el) => new NewsItemDTO(el))
      
      const pagination = new PaginationDTO(paginationPayload)
      
      return { docs, pagination }
    }

    throw ApiError.BadRequest('Incorrect request options')
  }
}

export default new NewsServices()
