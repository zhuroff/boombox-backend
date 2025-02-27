import {
  Cloud,
  CloudEntityDTO,
  CloudFolderContent,
  UnionCloudsEntity,
  CLoudQueryPayload
} from '../types/cloud.types'
import { google, drive_v3 } from 'googleapis'
import { auth } from 'google-auth-library'
import { rootDir } from '..'
import CloudEntityFactoryDTO from '../dto/cloud.dto'
import path from 'path'

export default class GoogleCloudApi implements Cloud {
  #domain = process.env['GCLOUD_DOMAIN']
  #collectionFolderId = process.env['GCLOUD_FOLDER_ID']
  #keyFilePath = path.join(rootDir, './auth-google.json')
  #client: typeof auth
  #drive: drive_v3.Drive

  #folderAttrs = new Set<keyof drive_v3.Schema$File>([
    'id',
    'name',
    'mimeType',
    'createdTime',
    'modifiedTime'
  ])

  #fileAttrs = new Map<string, keyof drive_v3.Schema$File>([
    ['image', 'thumbnailLink']
  ])

  #isFolderAcceptable(entity: drive_v3.Schema$File): entity is UnionCloudsEntity {
    return (
      (Object.keys(entity) as Array<keyof drive_v3.Schema$File>)
        .every((key) => this.#folderAttrs.has(key) && !!entity[key])
    )
  }

  #isFileAcceptable(entity: drive_v3.Schema$File, fileType: string): entity is UnionCloudsEntity {
    return !!(
      this.#isFolderAcceptable(entity)
      && CloudEntityFactoryDTO.isGoogleCloudEntity(entity)
      && entity.mimeType.startsWith(fileType)
    )
  }

  constructor() {
    this.#client = new google.auth.GoogleAuth({
      keyFile: this.#keyFilePath,
      scopes: [`${this.#domain}/auth/drive`]
    })

    this.#drive = google.drive({
      version: 'v3',
      auth: this.#client
    })
  }

  async getFolders() {
    try {
      const {
        data: { files: folders },
        config: { url }
      } = await this.#drive.files.list({
        fields: `nextPageToken, files(${[...this.#folderAttrs].join(',')})`,
        q: `'${this.#collectionFolderId}' in parents and mimeType='application/vnd.google-apps.folder'`
      })

      const cloudFolders = folders?.reduce<CloudEntityDTO[]>((acc, next) => {
        if (url && next && this.#isFolderAcceptable(next)) {
          acc.push(CloudEntityFactoryDTO.create(next, url))
        }

        return acc
      }, [])

      return cloudFolders || []
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getFolderContent(payload: CLoudQueryPayload): Promise<CloudFolderContent> {
    const { id, fileType } = payload

    if (!fileType) {
      throw new Error('"fileType" is required and should be a string for Google Cloud API')
    }

    try {
      const {
        data: { files },
        config: { url }
      } = await this.#drive.files.list({
        fields: `nextPageToken, files(${[...this.#folderAttrs].join(',')})`,
        q: `'${id}' in parents`
      })

      const filteredFiles = files?.reduce<CloudEntityDTO[]>((acc, next) => {
        if (url && this.#isFileAcceptable(next, fileType)) {
          acc.push(CloudEntityFactoryDTO.create(next, url))
        }

        return acc
      }, []) || []

      return {
        limit: -1,
        offset: 0,
        total: filteredFiles.length,
        items: filteredFiles
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getFile(payload: CLoudQueryPayload) {
    const { id, fileType } = payload
    
    if (!fileType) {
      throw new Error('"fileType" is required and should be a string for Google Cloud API')
    }

    try {
      const {
        data: { files }
      } = await this.#drive.files.list({
        fields: `nextPageToken, files(${[...this.#folderAttrs].join(',')})`,
        q: `'${id}' in parents`
      })

      const file = files?.find((entity) => this.#isFileAcceptable(entity, fileType))

      if (!file) return ''

      const fileDTO = CloudEntityFactoryDTO.create(file, String(this.#domain))
      const fileAttr = this.#fileAttrs.get(fileType)

      const { data } = await this.#drive.files.get({
        fileId: fileDTO.id,
        fields: this.#fileAttrs.get(fileType) || ''
      })

      if (!fileAttr || typeof data[fileAttr] !== 'string') return ''

      return data[fileAttr]
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}
