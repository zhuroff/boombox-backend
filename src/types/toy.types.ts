import { Request } from 'express'
import { AlbumDocument } from '../models/album.model'
import { CloudEntity, CloudFolderContent } from './cloud.types'
import { ListRequestConfig } from './pagination.types'

export type DeepPartial<T> = {
  [P in keyof T]?: 
    T[P] extends (infer U)[] ? DeepPartial<U>[] :
    T[P] extends object ? DeepPartial<T[P]> :
    T[P]
}

export interface TOYRepository {
  getTOYList(path: string): Promise<CloudEntity[]>
  getTOYAlbum(path: string): Promise<{ result: CloudFolderContent, coverURL?: string, metadataContent?: Record<string, string>[] | null }>
  getTOYListRandom(queryConfig: ListRequestConfig): Promise<DeepPartial<AlbumDocument>[]>
  getTOYContent(root: string, req: Request): Promise<Array<string | undefined>>
}
