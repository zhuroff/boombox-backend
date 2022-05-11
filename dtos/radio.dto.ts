import 'module-alias/register'
import { RadioBrowserStation, RadioBrowserStationResponse } from '~/types/Radio'

export class RadioStationDTO implements RadioBrowserStation {
  stationuuid
  name
  url
  url_resolved
  country
  tags

  constructor(station: RadioBrowserStationResponse) {
    this.stationuuid = station.stationuuid
    this.name = station.name
    this.url = station.url
    this.url_resolved = station.url_resolved
    this.country = station.country
    this.tags = station.tags
  }
}
