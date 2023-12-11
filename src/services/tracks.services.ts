import { Client } from 'genius-lyrics'
import { Types } from 'mongoose'
import { Cloud } from '../'
import { CloudEntityDTO } from '../dtos/cloud.dto'
import { Track } from '../models/track.model'
import { TrackResponse, TrackSearchPayload } from '../types/Track'
import utils from '../utils'

const GClient = new Client(process.env['GENIUS_SECRET'])

export default {
  async create(track: Required<CloudEntityDTO>, albumId: Types.ObjectId, artistId: Types.ObjectId) {
    const newTrack = new Track({
      ...track,
      title: utils.parseTrackTitle(track.title),
      fileName: track.title,
      inAlbum: albumId,
      artist: artistId
    })
    return await newTrack.save()
  },

  async remove(tracks: (string | Types.ObjectId)[]) {
    return await Track.deleteMany({ _id: { $in: tracks } })
  },

  async incrementListeningCounter(id: string) {
    return await Track.findByIdAndUpdate(id, { $inc: { listened: 1 } })
  },

  async saveTrackDuration(id: string, duration: number) {
    return await Track.findByIdAndUpdate(id, { $set: { duration } })
  },

  async getLyrics(id: string) {
    const response = await Track.findById(id)

    if (response) {
      return { lyrics: response.lyrics }
    }

    throw new Error('Incorrect request options')
  },

  async getLyricsExternal(query: string) {
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
  },

  async saveLyrics(id: string, lyrics: string) {
    return await Track.findByIdAndUpdate(id, { $set: { lyrics } })
  },

  async getAudio(path: string) {
    return await Cloud.getFile(path, 'audio')
  },

  async getCoveredTracks(docs: TrackResponse[]) {
    return await Promise.all(docs.map(async (track) => {
      const cover = await Cloud.getFile(
        `${utils.sanitizeURL(track.inAlbum.folderName)}/cover.webp`,
        'image'
      )
      if (cover) track.cover = cover
      return track
    }))
  }
}
