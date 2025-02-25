import { Request } from 'express'
import { Types } from 'mongoose'
import { Client } from 'genius-lyrics'
import { getCloudApi } from '..'
import { Track, TrackDocument } from '../models/track.model'
import { CompilationDocumentTrack } from '../models/compilation.model'
import { GatheringUpdateProps } from '../types/common.types'
import { CloudEntityDTO } from '../types/cloud.types'
import { TrackDTO } from '../dto/track.dto'
import utils from '../utils'

const GClient = new Client(process.env['GENIUS_SECRET'])

export default {
  async create(
    track: Required<CloudEntityDTO>,
    albumId: Types.ObjectId,
    artistId: Types.ObjectId,
    genreId: Types.ObjectId,
    periodId: Types.ObjectId,
    cloudURL: string
  ) {
    try {
      const newTrack = new Track({
        ...track,
        title: utils.parseTrackTitle(track.title),
        fileName: track.title,
        inAlbum: albumId,
        artist: artistId,
        genre: genreId,
        period: periodId,
        cloudURL
      })
      return await newTrack.save()
    } catch (error) {
      throw error
    }
  },
  async remove(tracks: (string | Types.ObjectId)[]) {
    try {
      return await Track.deleteMany({ _id: { $in: tracks } })
    } catch (error) {
      throw error
    }
  },
  async incrementListeningCounter(id: string) {
    try {
      return await Track.findByIdAndUpdate(id, { $inc: { listened: 1 } })
    } catch (error) {
      throw error
    }
  },
  async saveTrackDuration(id: string, duration: number) {
    try {
      return await Track.findByIdAndUpdate(id, { $set: { duration } })
    } catch (error) {
      throw error
    }
  },
  async getLyrics(id: string) {
    try {
      const response = await Track.findById(id)

      if (response) {
        return { lyrics: response.lyrics }
      }

      throw new Error('Incorrect request options')
    } catch (error) {
      throw error
    }
  },
  async getWave(req: Request) {
    const config = [
      {
        $lookup: {
          from: 'artists',
          localField: 'artist',
          foreignField: '_id',
          as: 'artist'
        }
      },
      {
        $lookup: {
          from: 'genres',
          localField: 'genre',
          foreignField: '_id',
          as: 'genre'
        }
      },
      {
        $lookup: {
          from: 'periods',
          localField: 'period',
          foreignField: '_id',
          as: 'period'
        }
      },
      {
        $lookup: {
          from: 'albums',
          localField: 'inAlbum',
          foreignField: '_id',
          as: 'inAlbum'
        }
      },
      { $match: { [req.body['filter']['key']]: req.body['filter']['name'] } },
      { $sample: { size: req.body['limit'] } }
    ]

    try {
      const waveTracks = await Track.aggregate(config)
      const coveredWaveTracks = await Promise.all(waveTracks.map(async (track) => {
        const cloudAPI = getCloudApi(track.inAlbum[0].cloudURL)
        return {
          ...track,
          coverURL: await cloudAPI.getFile(
            `${utils.sanitizeURL(track.inAlbum[0].folderName)}/cover.webp`,
            'image'
          )
        }
      }))

      return coveredWaveTracks.map((track: any) => (
        new TrackDTO({
          ...track,
          artist: track.artist[0],
          genre: track.genre[0],
          period: track.period[0],
          inAlbum: track.inAlbum[0]
        })
      ))
    } catch (error) {
      throw error
    }
  },
  async getLyricsExternal(query: string) {
    try {
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
    } catch (error) {
      throw error
    }
  },
  async saveLyrics(id: string, lyrics: string) {
    try {
      return await Track.findByIdAndUpdate(id, { $set: { lyrics } })
    } catch (error) {
      throw error
    }
  },
  async getAudio(path: string, cloudURL: string, root?: string) {
    const cloudAPI = getCloudApi(cloudURL)
    
    try {
      return await cloudAPI.getFile(path, 'audio', root)
    } catch (error) {
      throw error
    }
  },
  async getCoveredTracks(docs: TrackDocument[]) {
    try {
      return await Promise.all(docs.map(async (track) => {
        const cloudAPI = getCloudApi(track.cloudURL)
        const cover = await cloudAPI.getFile(
          `${utils.sanitizeURL(track.inAlbum.folderName)}/cover.webp`,
          'image'
        )
        if (cover) track.coverURL = cover
        return track
      }))
    } catch (error) {
      throw error
    }
  },
  async reduceTracksCompilations(tracks: CompilationDocumentTrack[], listID: string) {
    try {
      const cleanProcess = tracks.map(async (track) => {
        return await this.updateCompilationInTrack({
          listID,
          inList: false,
          itemID: track.track instanceof Types.ObjectId ? track.track : track.track._id
        })
      })
  
      return await Promise.all(cleanProcess)
    } catch (error) {
      throw error
    }
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
      throw error
    }
  } 
}
