import { CloudEntity } from './cloud'

export interface SyncRepository {
  fetchCloudFolders(root: string): Promise<CloudEntity[][]>
}
