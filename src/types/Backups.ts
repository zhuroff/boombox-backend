import { PaginateModel, Model } from 'mongoose'

export type BackupModel = Record<string, PaginateModel<any> | Model<any, {}, {}>>
