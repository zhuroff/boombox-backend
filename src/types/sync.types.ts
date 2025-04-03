import { CloudEntity } from '../types/cloud.types'

export interface SyncRepository {
  fetchCloudFolders(): Promise<CloudEntity[][]>
}
