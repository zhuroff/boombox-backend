import { Types } from 'mongoose'
import { Client } from 'genius-lyrics'
import { getCloudApi } from '..'
import { Track, TrackDocument } from '../models/track.model'
import { CompilationDocumentTrack } from '../models/compilation.model'
import { GatheringUpdateProps } from '../types/common.types'
import { CloudEntityDTO } from '../dto/cloud.dto'
import utils from '../utils'

const GClient = new Client(process.env['GENIUS_SECRET'])

export default {
  async create(
    track: Required<CloudEntityDTO>,
    albumId: Types.ObjectId,
    artistId: Types.ObjectId,
    cloudURL: string
  ) {
    try {
      const newTrack = new Track({
        ...track,
        title: utils.parseTrackTitle(track.title),
        fileName: track.title,
        inAlbum: albumId,
        artist: artistId,
        cloudURL
      })
      return await newTrack.save()
    } catch (error) {
      throw error
    }
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
      let lyrics = ''
      try {
        lyrics = await el.lyrics()
      } catch (error) {
        console.error(error)
      }

      return {
        title: el.title,
        thumbnail: el.thumbnail,
        artist: el.artist.name,
        lyrics
      }
    })

    return await Promise.all(resultArray)
  },
  async saveLyrics(id: string, lyrics: string) {
    return await Track.findByIdAndUpdate(id, { $set: { lyrics } })
  },
  async getAudio(path: string, cloudURL: string) {
    const cloudAPI = getCloudApi(cloudURL)
    return await cloudAPI.getFile(path, 'audio')
  },
  async getCoveredTracks(docs: TrackDocument[]) {
    return await Promise.all(docs.map(async (track) => {
      const cloudAPI = getCloudApi(track.cloudURL)
      const cover = await cloudAPI.getFile(
        `${utils.sanitizeURL(track.inAlbum.folderName)}/cover.webp`,
        'image'
      )
      if (cover) track.cover = cover
      return track
    }))
  },
  async reduceTracksCompilations(tracks: CompilationDocumentTrack[], listID: string) {
    const cleanProcess = tracks.map(async (track) => {
      return await this.updateCompilationInTrack({
        listID,
        inList: false,
        itemID: track.track instanceof Types.ObjectId ? track.track : track.track._id
      })
    })

    return await Promise.all(cleanProcess)
  },
  async updateCompilationInTrack({ listID, itemID, inList }: GatheringUpdateProps) {
    try {
      const query = { _id: itemID }
      const update = inList
        ? { $pull: { inCompilations: listID } }
        : { $push: { inCompilations: listID } }
      const options = { new: true }

      await Track.findOneAndUpdate(query, update, options)
    } catch (error) {
      console.log(error)
      throw error
    }
  } 
}
