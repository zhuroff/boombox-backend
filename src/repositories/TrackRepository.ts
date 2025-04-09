import { Request } from 'express'
import { PipelineStage, Types } from 'mongoose'
import { Client } from 'genius-lyrics'
import { AggregatedTrackDocument, Track, TrackDocument } from '../models/track.model'
import { AudioRequestPayload, NewTrackPayload, TrackRepository } from '../types/track.types'
import { GatheringUpdateProps } from '../types/gathering.types'
import { getCloudApi } from '..'
import Parser from '../utils/Parser'

export default class TrackRepositoryContract implements TrackRepository {
  private GClient = new Client(process.env['GENIUS_SECRET'])

  async createTrack(trackPayload: NewTrackPayload) {
    const newTrack = new Track({
      ...trackPayload.track,
      title: Parser.parseTrackTitle(trackPayload.track.title),
      fileName: trackPayload.track.title,
      inAlbum: trackPayload.albumId,
      artist: trackPayload.artistId,
      genre: trackPayload.genreId,
      period: trackPayload.periodId,
      cloudId: trackPayload.track.id,
      cloudURL: trackPayload.cloudURL
    })
    return await newTrack.save()
  }

  async removeTracks(tracks: Array<string | Types.ObjectId>) {
    return await Track.deleteMany({ _id: { $in: tracks } })
  }

  async incrementListeningCounter(id: string) {
    return await Track.findByIdAndUpdate(id, { $inc: { listened: 1 } })
  }

  async saveTrackDuration(id: string, duration: number) {
    return await Track.findByIdAndUpdate(id, { $set: { duration } })
  }

  async getTrackLyrics(id: string) {
    return await Track.findById(id).populate('lyrics')
    // const response = await Track.findById(id)
    
    // if (response) {
    //   return { lyrics: response.lyrics }
    // }

    // throw new Error('Incorrect request options')
  }

  async getTrackExternalLyrics(query: string) {
    const searches = await this.GClient.songs.search(query)
    return await Promise.all(searches.map(async (el) => {
      const lyrics = await el.lyrics() || ''

      return {
        title: el.title,
        thumbnail: el.thumbnail,
        artist: el.artist.name,
        lyrics
      }
    }))
  }

  async saveTrackLyrics(id: string, lyrics: string) {
    return await Track.findByIdAndUpdate(id, { $set: { lyrics } })
  }

  async getAudio(audioPayload: AudioRequestPayload) {
    const cloudAPI = getCloudApi(audioPayload.cloudURL)

    return await cloudAPI.getFile({
      id: audioPayload.id,
      path: audioPayload.path,
      fileType: 'audio'
    })
  }

  async getCoveredTracks(docs: TrackDocument[]) {
    return await Promise.all(docs.map(async (track) => {
      const cloudAPI = getCloudApi(track.cloudURL)
      const cover = await cloudAPI.getFile({
        id: track.cloudId,
        path: `${track.inAlbum.folderName}/cover.webp`,
        fileType: 'image'
      })
      if (cover) track.coverURL = cover
      return track
    }))
  }

  async updateCompilationInTrack({ listID, itemID, inList }: GatheringUpdateProps) {
    const query = { _id: itemID }
    const update = inList
      ? { $pull: { inCompilations: listID } }
      : { $push: { inCompilations: listID } }
    const options = { new: true }

    await Track.findOneAndUpdate(query, update, options)
  }
  async getWave(req: Request) {
    const config: PipelineStage[] = [
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
      {
        $match: {
          [req.body['filter']['key']]: req.body['filter']['name']
        }
      },
      {
        $sample: {
          size: req.body['limit']
        }
      }
    ]

    const waveTracks = await Track.aggregate<AggregatedTrackDocument>(config)

    return await Promise.all(waveTracks.map(async (track) => {
      const cloudURL = track.cloudURL
      const cloudId = track.cloudId
      const folderName = track.inAlbum[0]?.folderName

      if (!cloudURL || !cloudId || !folderName) {
        throw new Error('Incorrect request options')
      }

      const cloudAPI = getCloudApi(cloudURL)
      return {
        ...track,
        coverURL: await cloudAPI.getFile({
          id: cloudId,
          path: `${folderName}/cover.webp`,
          fileType: 'image'
        })
      }
    }))
  }
}
