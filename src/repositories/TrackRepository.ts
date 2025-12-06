import { PipelineStage, Types } from 'mongoose'
import { Client } from 'genius-lyrics'
import { AggregatedTrackDocument, Track, TrackDocument } from '../models/track.model'
import { Collection } from '../models/collection.model'
import { NewTrackPayload, TrackRepository } from '../types/track'
import { GatheringUpdateProps } from '../types/gathering'
import { ListRequestConfig } from '../types/pagination'
import { getCloudApi } from '..'
import Parser from '../utils/Parser'

export default class TrackRepositoryContract implements TrackRepository {
  private GClient = new Client(process.env['GENIUS_SECRET'])

  private async enrichTracksWithCovers(tracks: AggregatedTrackDocument[]): Promise<AggregatedTrackDocument[]> {
    return await Promise.all(tracks.map(async (track) => {
      const cloudURL = track.cloudURL
      const cloudId = track.cloudId
      const albumPath = track.inAlbum[0]?.path

      if (!cloudURL || !cloudId) {
        throw new Error('Incorrect request options')
      }

      const cloudAPI = getCloudApi(cloudURL)
      return {
        ...track,
        coverURL: albumPath
          ? await cloudAPI.getFile({
              path: `${albumPath}/cover.webp`,
              fileType: 'image'
            })
          : undefined
      }
    }))
  }

  private async getWaveByCollection(collectionTitle: string, limit: number): Promise<AggregatedTrackDocument[]> {
    const collection = await Collection.findOne({ title: collectionTitle })
    
    if (!collection) {
      return []
    }

    const albumIds = collection.albums.map((item) => item.album as Types.ObjectId)

    if (albumIds.length === 0) {
      return []
    }

    const queryConfig: PipelineStage[] = [
      {
        $match: {
          inAlbum: { $in: albumIds }
        }
      },
      ...this.buildCommonLookupStages(),
      {
        $sample: {
          size: limit
        }
      }
    ]

    return await Track.aggregate<AggregatedTrackDocument>(queryConfig)
  }

  private buildCommonLookupStages(): PipelineStage[] {
    return [
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
      }
    ]
  }

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

  async updateTrack(trackPayload: Partial<TrackDocument>) {
    return await Track.findByIdAndUpdate(trackPayload._id, trackPayload, { new: true })
  }

  async removeTracks(tracks: Array<string | Types.ObjectId>) {
    return await Track.deleteMany({ _id: { $in: tracks } })
  }

  async saveTrackDuration(id: string, duration: number) {
    return await Track.findByIdAndUpdate(id, { $set: { duration } })
  }

  async getTrackLyrics(id: string) {
    const response = await Track.findById(id).populate('lyrics')
    return { lyrics: response?.lyrics || null }
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

  async getTrackAudio(path: string, cloudURL: string) {
    const cloudAPI = getCloudApi(cloudURL)

    return await cloudAPI.getFile({
      path,
      fileType: 'audio'
    })
  }

  async getCoveredTracks(docs: TrackDocument[]) {
    return await Promise.all(docs.map(async (track) => {
      const cloudAPI = getCloudApi(track.cloudURL)
      const cover = await cloudAPI.getFile({
        path: `${track.inAlbum.path}/cover.webp`,
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

  async getWave(config: ListRequestConfig) {
    if (!config['filter']) {
      throw new Error('Incorrect request options')
    }

    // Special handling for collection filter
    if (config['filter']['key'] === 'collection.title') {
      const collectionTitle = String(config['filter']['name'])
      const waveTracks = await this.getWaveByCollection(collectionTitle, config['limit'])
      return await this.enrichTracksWithCovers(waveTracks)
    }

    // Standard filter for artist, genre, period
    const queryConfig: PipelineStage[] = [
      ...this.buildCommonLookupStages(),
      {
        $match: {
          [config['filter']['key']]: String(config['filter']['name'])
        }
      },
      {
        $sample: {
          size: config['limit']
        }
      }
    ]

    const waveTracks = await Track.aggregate<AggregatedTrackDocument>(queryConfig)
    return await this.enrichTracksWithCovers(waveTracks)
  }
}
