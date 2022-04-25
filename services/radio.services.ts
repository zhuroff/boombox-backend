import { Radio } from '~/models/radio.model'
import { ApiError } from '~/exceptions/api-errors'
import { RadioBrowserStation, RadioRequestConfig } from '~/types/Radio'
import { RadioStationDTO } from '~/dtos/radio.dto'
import RadioBrowser from 'radio-browser'

class RadioServices {
  async savedStations() {
    const response = await Radio.find({}).sort({ name: -1 }).exec()
    console.log('savedStations res', response)
    const fetchingStations = response.map(async (el) => {
      const filter = {
        by: 'uuid',
        searchterm: el.stationuuid
      }

      const station: RadioBrowserStation = await RadioBrowser.getStations(filter)
      console.log('station', station)
      return new RadioStationDTO(station)
    })

    const stations = await Promise.all(fetchingStations)

    if (stations) {
      return stations
    }

    throw ApiError.BadRequest('Incorrect request options')
  }

  async allStations({ genre, offset }: RadioRequestConfig) {
    const filter = {
      by: 'tag',
      limit: 100,
      searchterm: genre,
      offset
    }

    const response: RadioBrowserStation[] = await RadioBrowser.getStations(filter)
    
    if (response) {
      return response
        .sort((a, b) => b.votes - a.votes)
        .map((station) => new RadioStationDTO(station))
    }

    throw ApiError.BadRequest('Incorrect request options')
  }
}

export default new RadioServices()
