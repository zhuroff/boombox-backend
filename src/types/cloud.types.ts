import { AxiosRequestConfig } from 'axios'
import PCloudApi from '../clouds/cloud.pcloud'
import YandexCloudApi from '../clouds/cloud.yandex'
import CloudEntityViewFactory from '../views/CloudEntityViewFactory'

export type CloudApi = PCloudApi | YandexCloudApi
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

export type UnionCloudsEntity = PCloudEntity | YandexCloudEntity

export type CloudEntity = ReturnType<typeof CloudEntityViewFactory.create>

export interface PCloudResponse<T> {
  file?: string
  metadata: {
    contents: T[]
  }
}

export interface YandexCloudResponse<T> {
  file?: string
  _embedded: {
    items: T[]
    limit: number
    offset: number
    total: number
    sort: string
  }
}

export interface CloudFolderContent {
  limit: number
  offset: number
  total: number
  sort?: string
  items: CloudEntity[]
}

export interface CLoudQueryPayload {
  id: string
  path?: string
  cluster?: string
  fileType?: CloudFileTypes
}

export interface CloudReqPayload {
  id: string
  path: string
  cloudURL: string
}

export interface CloudReqPayloadFilter extends CloudReqPayload {
  value: string
  exclude: string
  cluster: string
  type?: CloudFileTypes
  limit?: number
  offset?: number
}

export interface Cloud {
  getFolders: (payload: CLoudQueryPayload, params?: AxiosRequestConfig) => Promise<CloudEntity[] | null>
  getFolderContent: (payload: CLoudQueryPayload) => Promise<CloudFolderContent | void>
  getFile: (payload: CLoudQueryPayload) => Promise<void | any>
}
