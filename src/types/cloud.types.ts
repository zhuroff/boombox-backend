import { AxiosRequestConfig } from 'axios'
import { CloudEntityDTO } from '../dto/cloud.dto'
import { PCloudApi } from '../clouds/cloud.pcloud'
import { YandexCloudApi } from '../clouds/cloud.yandex'

export type CloudApi = PCloudApi | YandexCloudApi
export type CloudFileTypes = 'audio' | 'video' | 'image' | 'file'

export type CloudCommonEntity = {
  name: string
  path: string
  created: string
  modified: string
}

export type PCloudEntity = CloudCommonEntity & {
  id: string
  isfolder: boolean
  contenttype?: string
}

export interface PCloudResponseError {
  result: number
  error: string
}

export interface PCloudFileResponse extends Omit<PCloudResponseError, 'error'> {
  dwltag: string
  hash: number
  size: number
  path: string
  hosts: string[]
}

export type YandexCloudEntity = CloudCommonEntity & {
  resource_id: string
  type: 'dir' | 'file'
  mime_type?: string
}

export type UnionCloudsEntity =
  PCloudEntity |
  YandexCloudEntity

export type PCloudResponse<T> = {
  file?: string
  metadata: {
    contents: T[]
  }
}

export type YandexCloudResponse<T> = {
  file?: string
  _embedded: {
    items: T[]
    limit: number
    offset: number
    total: number
    sort: string
  }
}

export type CloudFolderContent = {
  items: CloudEntityDTO[]
  limit: number
  offset: number
  total: number
  sort?: string
}

export interface Cloud {
  getFolders: (path: string, params?: AxiosRequestConfig) => Promise<null | CloudEntityDTO[]>
  getFolderContent: (path: string) => Promise<void | CloudFolderContent>
  getFile: (path: string, fileType: CloudFileTypes) => Promise<void | any>
}
