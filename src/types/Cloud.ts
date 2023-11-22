import { AxiosRequestConfig } from "axios"
import { CloudEntityDTO } from "../dtos/cloud.dto"

export type CloudCommon = {
  name: string
  created: string
  modified: string
  path: string
  type: string
}

export type CloudFolder = CloudCommon & {
  mime_type?: string
  _embedded: {
    items: CloudFolderItem[]
  }
}

export type CloudFile = CloudCommon & {
  file: string
  mime_type: string
  media_type: string
}

export type CloudFolderItem = CloudFolder | CloudFile

// NEW
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

export interface CloudAPI {
  getFolders: (path: string, params?: AxiosRequestConfig) => Promise<void | CloudEntityDTO[]>
  getFolderContent: (path: string) => Promise<void | CloudFolderContent>
  getFile: (path: string) => Promise<void | any>
}
