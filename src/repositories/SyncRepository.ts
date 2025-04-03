import { cloudsMap } from '..'
import { SyncRepository } from '../types/sync.types'

export default class SyncRepositoryContract implements SyncRepository {
  async fetchCloudFolders() {
    return await Promise.all([...cloudsMap].map(async ([_, cloudAPI]) => (
      await cloudAPI.getFolders(
        { id: '', path: '' },
        { params: { limit: 5000 } }
      )
    )))
  }
}
