import { Types } from 'mongoose'

type RadioModel = {
  _id: Types.ObjectId
  name: string
  stationuuid: string
  dateCreated: Date
}

type RadioRequestConfig = {
  genre: string
  offset: number
}

type RadioBrowserStation = {
  stationuuid: string
  name: string
  url: string
  url_resolved: string
  homepage: string
  favicon: string
  country: string
  countrycode: string
  votes: number
}

export {
  RadioModel,
  RadioRequestConfig,
  RadioBrowserStation
}
