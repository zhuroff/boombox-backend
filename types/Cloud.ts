export type CloudCommon = {
  name: string
  resource_id: string
  created: string
  modified: string
  path: string
  type: string
}

export type CloudFolder = CloudCommon & {
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
