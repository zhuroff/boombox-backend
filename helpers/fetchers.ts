import axios, { AxiosRequestConfig } from 'axios'

export const fetchers = {
  cloudQueryLink: (param: string) => {
    return `${process.env['CLOUD_DOMAIN']}/${param}&username=${process.env['CLOUD_LOGIN']}&password=${process.env['CLOUD_PASSWORD']}`
  },

  discogsQueryLink: (param: string) => {
    return `${process.env['DISCOGS_DOMAIN']}/database/search?${param}&key=${process.env['DISCOGS_KEY']}&secret=${process.env['DISCOGS_SECRET']}`
  },

  getData: async (query: string, params?: AxiosRequestConfig) => {
    try {
      const response = await axios.get(query, params)
      return response
    } catch (error) {
      throw error
    }
  }
}
