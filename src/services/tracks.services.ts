import { Client } from 'genius-lyrics'
import { Types } from 'mongoose'
import { CloudEntityDTO } from '../dtos/cloud.dto'
import { Track } from '../models/track.model'
import { Cloud } from '../'
import { TrackResponse, TrackSearchPayload } from '../types/Track'
import utils from '../utils'

const GClient = new Client(process.env['GENIUS_SECRET'])

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

    throw new Error('Incorrect request options')
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

  async getTrack(path: string) {
    return await Cloud.getFile(`${process.env['COLLECTION_ROOT']}/Collection/${path}`)
  }

  async getCoveredTracks(docs: TrackResponse[]) {
    return await Promise.all(docs.map(async (track) => {
      const cover = await Cloud.getFile(
        `${process.env['COLLECTION_ROOT']}/Collection/${utils.sanitizeURL(track.inAlbum.folderName)}/cover.webp`
      )
      if (cover) track.cover = cover
      return track
    }))
  }
}

export default new TracksServices()
