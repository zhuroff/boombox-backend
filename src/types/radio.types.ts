export type RadioRequestConfig = {
  genre: string
  offset: number
  limit: number
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
