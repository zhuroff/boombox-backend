import { AxiosRequestConfig } from 'axios'
import PCloudApi from '../clouds/cloud.pcloud'
import YandexCloudApi from '../clouds/cloud.yandex'
import GoogleCloudApi from '../clouds/cloud.google'
import CloudEntityFactoryDTO from '../dto/cloud.dto'

export type CloudApi = PCloudApi | YandexCloudApi | GoogleCloudApi
export type CloudFileTypes = 'audio' | 'video' | 'image' | 'file'

export interface CloudCommonEntity {
  name: string
  path: string
  created: string
  modified: string
}

export interface PCloudEntity extends CloudCommonEntity {
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

export interface YandexCloudEntity extends CloudCommonEntity {
  resource_id: string
  type: 'dir' | 'file'
  mime_type?: string
}

export interface GoogleCloudEntity {
  id: string
  name: string
  mimeType: string
  createdTime: string
  modifiedTime: string
}

export type UnionCloudsEntity =
  PCloudEntity
  | YandexCloudEntity
  | GoogleCloudEntity

export type CloudEntityDTO = ReturnType<typeof CloudEntityFactoryDTO['create']>

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
  limit: number
  offset: number
  total: number
  sort?: string
  items: CloudEntityDTO[]
}

export interface Cloud {
  getFolders: (path: string, params?: AxiosRequestConfig) => Promise<CloudEntityDTO[] | null>
  getFolderContent: (path: string, root?: string) => Promise<CloudFolderContent | void>
  getFile: (path: string, fileType: CloudFileTypes) => Promise<void | any>
}
