import { Request } from 'express'
import { DeleteResult, Document, Types } from 'mongoose'
import { CloudEntity } from './cloud'
import { AggregatedTrackDocument, TrackDocument } from '../models/track.model'
import { GatheringUpdateProps } from './gathering'

export type TrackDocumentNullable = Document<unknown, {}, TrackDocument> | null

export interface NewTrackPayload {
  track: Required<CloudEntity>,
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

export interface TrackRepository {
  createTrack(trackPayload: NewTrackPayload): Promise<TrackDocument>
  updateTrack(trackPayload: Partial<TrackDocument>): Promise<TrackDocument | null>
  removeTracks(tracks: Array<string | Types.ObjectId>): Promise<DeleteResult>
  saveTrackDuration(id: string, duration: number): Promise<TrackDocumentNullable>
  getTrackLyrics(id: string): Promise<{ lyrics: string | null }>
  getTrackExternalLyrics(query: string): Promise<ExternalTrackLyricsResponse[]>
  getTrackAudio(path: string, cloudURL: string): Promise<string | undefined>
  getCoveredTracks(docs: TrackDocument[]): Promise<TrackDocument[]>
  updateCompilationInTrack(payload: GatheringUpdateProps): Promise<void>
  getWave(config: ListRequestConfig): Promise<AggregatedTrackDocument[]>
}
