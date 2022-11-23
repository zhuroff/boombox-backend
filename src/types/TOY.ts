import { Document } from 'mongoose'

export type TOYModelTrack = {
  trackId: string
  description?: string
  iframe?: string
}

export type TOYModel = {
  dateCreated: Date
  folderId: string
  preface?: string
  afterword?: string
  tracks: TOYModelTrack[]
}

export interface TOYDocument extends Document, TOYModel { }
