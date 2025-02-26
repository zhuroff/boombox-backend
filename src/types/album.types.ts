import { CloudEntityDTO } from './cloud.types'

export interface AlbumShape {
  title: string
  folderName: string
  cloudId: string
  cloudURL: string
  artist: string
  genre: string
  period: string
  tracks: Array<Required<CloudEntityDTO>>
}
