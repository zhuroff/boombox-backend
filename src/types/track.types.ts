import { Request } from 'express'
import { DeleteResult, Document, Types } from 'mongoose'
import { CloudEntityDTO } from '../types/cloud.types'
import { AggregatedTrackDocument, TrackDocument } from '../models/track.model'
import { GatheringUpdateProps } from './common.types'

export interface NewTrackPayload {
  track: Required<CloudEntityDTO>,
  albumId: Types.ObjectId,
  artistId: Types.ObjectId,
  genreId: Types.ObjectId,
  periodId: Types.ObjectId,
  cloudURL: string
}

export interface ExternalTrackLyricsResponse {
  title: string
  thumbnail: string
  artist: string
  lyrics: string
}

export interface AudioRequestPayload {
  id: string
  path: string
  cloudURL: string
  cluster?: string
}

export type TrackDocumentNullable = Document<unknown, {}, TrackDocument> | null

export interface TrackRepository {
  createTrack(trackPayload: NewTrackPayload): Promise<TrackDocument>
  removeTracks(tracks: Array<string | Types.ObjectId>): Promise<DeleteResult>
  incrementListeningCounter(id: string): Promise<TrackDocumentNullable>
  saveTrackDuration(id: string, duration: number): Promise<TrackDocumentNullable>
  getTrackLyrics(id: string): Promise<TrackDocumentNullable>
  getTrackExternalLyrics(query: string): Promise<ExternalTrackLyricsResponse[]>
  saveTrackLyrics(id: string, lyrics: string): Promise<TrackDocumentNullable>
  getAudio(audioPayload: AudioRequestPayload): Promise<string | undefined>
  getCoveredTracks(docs: TrackDocument[]): Promise<TrackDocument[]>
  updateCompilationInTrack(payload: GatheringUpdateProps): Promise<void>
  getWave(req: Request): Promise<AggregatedTrackDocument[]>
}
