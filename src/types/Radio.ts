import { Types } from 'mongoose'

export type RadioModel = {
  _id: Types.ObjectId
  name: string
  stationuuid: string
  dateCreated: Date
}

export type RadioRequestConfig = {
  genre: string
  offset: number
}

export type RadioBrowserStation = {
  stationuuid: string
  name: string
  url: string
  url_resolved: string
  country: string
  tags: string
}

export type RadioBrowserStationResponse = RadioBrowserStation & {
  votes: number
}

export type RadioSavePayload = {
  stationuuid: string
  name: string
}
