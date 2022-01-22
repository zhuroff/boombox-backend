import 'module-alias/register'
import { fetchers } from './fetchers'
import { PaginateResult } from 'mongoose'
import { AlbumModel, AlbumModelDocument } from '~/types/Album'

const getImageLink = async (id: number): Promise<string | 0> => {
  const query = fetchers.cloudQueryLink(`getfilelink?fileid=${id}`)
  const response = await fetchers.getData(query)
  return response.data.error ? 0 : `https://${response.data.hosts[0]}${response.data.path}`
}

const getAlbumsWithCover = async (payload: PaginateResult<AlbumModel> | AlbumModelDocument[]) => {
  const data = Array.isArray(payload) ? payload :  payload.docs

  try {
    const coverMap = data.map(async (el: AlbumModel) => {
      el.albumCover = await getImageLink(Number(el.albumCover))
      return el
    })
  
    const result = await Promise.all(coverMap)
    return result
  } catch (error) {
    return error
  }
}

export {
  getImageLink,
  getAlbumsWithCover
}
