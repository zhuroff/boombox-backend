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
  country: string
  tags: string
}

type RadioBrowserStationResponse = RadioBrowserStation & {
  votes: number
}

type RadioSavePayload = {
  stationuuid: string
  name: string
}

export {
  RadioModel,
  RadioRequestConfig,
  RadioBrowserStation,
  RadioBrowserStationResponse,
  RadioSavePayload
}
