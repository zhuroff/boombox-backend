import { CloudEntityDTO } from '../dto/cloud.dto'

export interface AlbumShape {
  title: string
  folderName: string
  cloudURL: string
  artist: string
  genre: string
  period: string
  tracks: Array<Required<CloudEntityDTO>>
}
