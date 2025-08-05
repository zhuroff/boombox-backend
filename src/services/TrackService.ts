import { Request } from 'express'
import { Types } from 'mongoose'
import { TrackDocument } from '../models/track.model'
import { CompilationDocumentTrack } from '../models/compilation.model'
import { AudioRequestPayload, NewTrackPayload, TrackRepository } from '../types/track'
import TrackViewFactory from '../views/TrackViewFactory'
import Parser from '../utils/Parser'

export default class TrackService {
  constructor(private trackRepository: TrackRepository) {}

  async createTrack(trackPayload: NewTrackPayload) {
    return await this.trackRepository.createTrack(trackPayload)
  }

  async updateTrack(trackPayload: Partial<TrackDocument>) {
    return await this.trackRepository.updateTrack(trackPayload)
  }

  async removeTracks(tracks: Array<string | Types.ObjectId>) {
    return await this.trackRepository.removeTracks(tracks)
  }

  async incrementListeningCounter(id: string) {
    return await this.trackRepository.incrementListeningCounter(id)
  }

  async saveTrackDuration(id: string, duration: number) {
    return await this.trackRepository.saveTrackDuration(id, duration)
  }

  async getTrackLyrics(id: string) {
    return await this.trackRepository.getTrackLyrics(id)
  }

  async getTrackExternalLyrics(req: Request) {
    const parsedQuery = Parser.parseNestedQuery<{ query: string }>(req)
    return await this.trackRepository.getTrackExternalLyrics(parsedQuery.query)
  }

  async getAudio(audioPayload: AudioRequestPayload) {
    return await this.trackRepository.getAudio(audioPayload)
  }

  async getCoveredTracks(docs: TrackDocument[])  {
    return await this.trackRepository.getCoveredTracks(docs)
  }

  async reduceTracksCompilations(tracks: CompilationDocumentTrack[], listID: string) {
    const cleanProcess = tracks.map(async (track) => {
      return await this.trackRepository.updateCompilationInTrack({
        listID,
        inList: false,
        itemID: track.track instanceof Types.ObjectId ? track.track : track.track._id
      })
    })

    return await Promise.all(cleanProcess)
  }

  async getWave(req: Request) {
    const waveTracks = await this.trackRepository.getWave(req)
    return waveTracks.map((track) => {
      const { artist, genre, period, inAlbum } = track

      if (!artist[0] || !genre[0] || !period[0] || !inAlbum[0]) {
        throw new Error('Incorrect request options')
      }

      return TrackViewFactory.create({
        ...track,
        artist: artist[0],
        genre: genre[0],
        period: period[0],
        inAlbum: inAlbum[0]
      })
    })
  }
}
