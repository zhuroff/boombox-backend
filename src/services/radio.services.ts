import { Radio } from '../models/radio.model'
import { RadioBrowserStationResponse, RadioRequestConfig, RadioSavePayload } from '../types/Radio'
import { RadioStationDTO } from '../dtos/radio.dto'
// @ts-ignore
import RadioBrowser from 'radio-browser'

class RadioServices {
  async savedStations() {
    const response = await Radio.find({}).sort({ name: -1 }).exec()
    const fetchingStations = response.map(async (el) => {
      const filter = {
        by: 'uuid',
        searchterm: el.stationuuid
      }
      const station: RadioBrowserStationResponse[] = await RadioBrowser.getStations(filter)

      return station[0] && new RadioStationDTO(station[0])
    })

    const stations = await Promise.all(fetchingStations)

    if (stations) {
      return stations.filter((station) => station)
    }

    throw new Error('Incorrect request options')
  }

  async allStations({ genre, offset }: RadioRequestConfig) {
    const filter = {
      by: 'tag',
      limit: 51,
      searchterm: genre,
      offset
    }

    const response: RadioBrowserStationResponse[] = await RadioBrowser.getStations(filter)

    if (response) {
      return response
        .sort((a, b) => b.votes - a.votes)
        .map((station) => new RadioStationDTO(station))
    }

    throw new Error('Incorrect request options')
  }

  async saveStation({ stationuuid, name }: RadioSavePayload) {
    const newStation = new Radio({ stationuuid, name })

    await newStation.save()

    return { message: 'Station was successfully saved' }
  }

  async deleteStation(stationuuid: string) {
    const response = await Radio.findOneAndDelete({ stationuuid })

    if (response) {
      return { message: 'Station was successfully deleted' }
    }

    throw new Error('Incorrect request options')
  }
}

export default new RadioServices()
