import { fetchers } from "~/helpers/fetchers"
import { AlbumModel, IAlbum } from "~/types/Album"

export class CoversLib {
  static async getImageLink(id: number) {
    const query = fetchers.cloudQueryLink(`getfilelink?fileid=${id}`)
    const response = await fetchers.getData(query)
    return response.data.error ? 0 : `https://${response.data.hosts[0]}${response.data.path}`
  }

  static async covers(items: IAlbum[]): Promise<AlbumModel[]> {
    const result = items.map(async (item) => ({
      ...item,
      albumCover: await this.getImageLink(Number(item.albumCover))
    }))

    return await Promise.all(result)
  }
}