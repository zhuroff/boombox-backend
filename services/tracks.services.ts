import { ApiError } from '~/exceptions/api-errors'
import { Track } from '~/models/track.model'
import { TrackSearchPayload } from '~/types/Track'
import Genius from 'genius-lyrics'

const GClient = new Genius.Client(process.env['GENIUS_SECRET'])

class TracksServices {
  async incrementListening(id: string) {
    return await Track.findByIdAndUpdate(id, { $inc: { listened: 1 } })
  }

  async duration(id: string, duration: number) {
    return await Track.findByIdAndUpdate(id, { $set: { duration } })
  }

  async lyricsDB(id: string) {
    const response = await Track.findById(id)

    if (response) {
      return { lyrics: response.lyrics }
    }

    throw ApiError.BadRequest('Incorrect request options')
  }

  async lyricsExternal(query: string) {
    const searches = await GClient.songs.search(query)
    const resultArray = searches.map(async (el) => {
      const item: TrackSearchPayload = {
        title: el.title,
        thumbnail: el.thumbnail,
        artist: el.artist.name,
        lyrics: await el.lyrics()
      }

      return item
    })

    return await Promise.all(resultArray)
  }

  async save(id: string, lyrics: string) {
    return await Track.findByIdAndUpdate(id, { $set: { lyrics } })
  }
}

export default new TracksServices()
