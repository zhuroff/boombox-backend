import { CloudEntityDTO } from '../types/cloud.types'

export interface SyncRepository {
  fetchCloudFolders(): Promise<CloudEntityDTO[][]>
}
