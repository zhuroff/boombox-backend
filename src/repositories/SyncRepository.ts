import { cloudsMap } from '..'
import { SyncRepository } from '../types/sync'

export default class SyncRepositoryContract implements SyncRepository {
  async fetchCloudFolders(root: string) {
    return await Promise.all([...cloudsMap].map(async ([_, cloudAPI]) => (
      await cloudAPI.getFolders({ path: root, limit: 5000 })
    )))
  }
}
