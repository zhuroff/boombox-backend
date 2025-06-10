import { Request } from 'express'
import { AlbumDocument } from '../models/album.model'
import { CloudEntity, CloudFolderContent } from './cloud'
import { ListRequestConfig } from './pagination'

export type TOYAlbumRes = {
  result: CloudFolderContent
  coverURL?: string
  metadataContent?: Record<string, string>[] | null
}

export type TOYAlbumListItem = {
  title: string
  genre: string
  period: string
  path: string
}

export interface TOYRepository {
  getTOYList(path: string): Promise<CloudEntity[]>
  getTOYAlbum(path: string): Promise<TOYAlbumRes>
  getTOYListRandom(queryConfig: ListRequestConfig): Promise<TOYAlbumListItem[]>
  getTOYContent(root: string, req: Request): Promise<Array<string | undefined>>
}
