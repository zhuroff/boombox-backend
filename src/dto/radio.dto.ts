import { RadioBrowserStation, RadioBrowserStationResponse } from '../types/radio.types'

export class RadioStationDTO implements RadioBrowserStation {
  stationuuid: string
  name: string
  url: string
  url_resolved: string
  country: string
  tags: string

  constructor(station: RadioBrowserStationResponse) {
    this.stationuuid = station.stationuuid
    this.name = station.name
    this.url = station.url
    this.url_resolved = station.url_resolved
    this.country = station.country
    this.tags = station.tags
  }
}
