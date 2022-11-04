import { PaginateModel, Model } from 'mongoose'

type BackupModel = {
  [index: string]: PaginateModel<any> | Model<any, {}, {}>
}

export {
  BackupModel
}
