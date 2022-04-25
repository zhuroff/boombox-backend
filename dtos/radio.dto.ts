import { RadioBrowserStation } from '~/types/Radio'

export class RadioStationDTO implements RadioBrowserStation {
  stationuuid
  name
  url
  url_resolved
  homepage
  favicon
  country
  countrycode
  votes

  constructor(station: RadioBrowserStation) {
    this.stationuuid = station.stationuuid
    this.name = station.name
    this.url = station.url
    this.url_resolved = station.url_resolved
    this.homepage = station.homepage
    this.favicon = station.favicon
    this.country = station.country
    this.countrycode = station.countrycode
    this.votes = station.votes
  }
}
