import { CloudEntity } from '../types/cloud.types'

export interface SyncRepository {
  fetchCloudFolders(root: string): Promise<CloudEntity[][]>
}
