import { google, drive_v3 } from 'googleapis'
import { auth } from 'google-auth-library'
import { rootDir } from '..'
import { Cloud, CloudEntityDTO, CloudFileTypes, CloudFolderContent, UnionCloudsEntity } from '../types/cloud.types'
import path from 'path'
import utils from '../utils'
import CloudEntityFactoryDTO from '../dto/cloud.dto'

export default class GoogleCloudApi implements Cloud {
  #domain = process.env['GCLOUD_DOMAIN']
  #collectionFolderId = process.env['GCLOUD_FOLDER_ID']
  #keyFilePath = path.join(rootDir, './auth-google.json')
  #client: typeof auth
  #drive: drive_v3.Drive

  #typesQuery: Record<string, string> = {
    audio: [...utils.audioMimeTypes]
      .map((mimeType) => `mimeType='${mimeType}'`).join(' or '),
    image: [...utils.imagesMimeTypes]
      .map((mimeType) => `mimeType='${mimeType}'`).join(' or ')
  }

  #folderAttrs = new Set<keyof drive_v3.Schema$File>([
    'id',
    'name',
    'mimeType',
    'createdTime',
    'modifiedTime'
  ])

  #isFolderAcceptable(folder: drive_v3.Schema$File): folder is UnionCloudsEntity {
    return (
      (Object.keys(folder) as Array<keyof drive_v3.Schema$File>)
        .every((key) => this.#folderAttrs.has(key) && !!folder[key])
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

  async getFolderContent(id: string, fileType: string = 'audio'): Promise<CloudFolderContent> {
    try {
      const {
        data: { files },
        config: { url }
      } = await this.#drive.files.list({
        fields: `nextPageToken, files(${[...this.#folderAttrs].join(',')})`,
        q: `'${id}' in parents and ${this.#typesQuery[fileType]}`
      })

      return {
        limit: -1,
        offset: 0,
        total: files?.length || 0,
        items: files?.reduce<CloudEntityDTO[]>((acc, next) => {
          const isValidFile = url
            && next
            && this.#isFolderAcceptable(next)
            && CloudEntityFactoryDTO.isGoogleCloudEntity(next)

          if (isValidFile) {
            acc.push(CloudEntityFactoryDTO.create(next, url, next.id))
          }

          return acc
        }, []) || []
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getFile(path: string, fileType: CloudFileTypes, root?: string) {
    try {
      return await Promise.resolve('')
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}
