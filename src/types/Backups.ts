import { PaginateModel, Model } from 'mongoose'

export type BackupModel = {
  [index: string]: PaginateModel<any> | Model<any, {}, {}>
}
