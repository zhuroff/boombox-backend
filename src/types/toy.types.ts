import { CloudEntity, CloudFolderContent, CloudReqPayloadFilter } from './cloud.types'

export interface TOYRepository {
  getFolderContent(filter: Omit<CloudReqPayloadFilter, 'value' | 'exclude'>): Promise<CloudFolderContent>
  getCloudFile(filter: Omit<CloudReqPayloadFilter, 'value' | 'exclude'>): Promise<string | undefined>
  getImageWithURL(item: Required<CloudEntity>, cluster: string): Promise<CloudEntity>
}
