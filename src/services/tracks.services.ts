// import Genius from 'genius-lyrics'
import { Types } from 'mongoose'
import { CloudEntityDTO } from '../dtos/cloud.dto'
import { ApiError } from '../exceptions/api-errors'
import { Track } from '../models/track.model'
import utils from '../utils'
// import { TrackSearchPayload } from '../types/Track'

// const GClient = new Genius.Client(process.env['GENIUS_SECRET'])

class TracksServices {
  async create(track: Required<CloudEntityDTO>, albumId: Types.ObjectId, artistId: Types.ObjectId) {
    const newTrack = new Track({
      ...track,
      title: utils.parseTrackTitle(track.title),
      fileName: track.title,
      inAlbum: albumId,
      artist: artistId
    })
    return await newTrack.save()
  }

  async remove(tracks: (string | Types.ObjectId)[]) {
    return await Track.deleteMany({ _id: { $in: tracks } })
  }

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
    // const searches = await GClient.songs.search(query)
    // const resultArray = searches.map(async (el) => {
    //   const item: TrackSearchPayload = {
    //     title: el.title,
    //     thumbnail: el.thumbnail,
    //     artist: el.artist.name,
    //     lyrics: await el.lyrics()
    //   }

    //   return item
    // })

    // return await Promise.all(resultArray)
  }

  async save(id: string, lyrics: string) {
    return await Track.findByIdAndUpdate(id, { $set: { lyrics } })
  }
}

export default new TracksServices()
