import 'module-alias/register'
import { fetchers } from './fetchers'
import { PaginateResult } from 'mongoose'
import { AlbumModel } from '~/types/Album'

const getAlbumsWithCover = async (response: PaginateResult<AlbumModel>) => {
  const data = response.docs || response

  try {
    const coverMap = data.map(async (el: AlbumModel) => {
      const query = fetchers.cloudQueryLink(`getfilelink?fileid=${el.albumCover}`)
      const cover = await fetchers.getData(query)
      
      if (cover.data.error) {
        el.albumCover = 'https://s.mxmcdn.net/site/images/album-placeholder.png'
        return el
      }
  
      // el.coverID = el.albumCover as number
      el.albumCover = `https://${cover.data.hosts[0]}${cover.data.path}`
      return el
    })
  
    const result = await Promise.all(coverMap)
    return result
  } catch (error) {
    return error
  }
}

export default getAlbumsWithCover
