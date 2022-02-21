import { Request } from 'express'
import { ApiError } from '~/exceptions/api-errors'
import { Album } from '~/models/album.model'
import { PaginatedPageBasicOptions, Populate, ResponseMessage } from '~/types/ReqRes'
import { TrackModel } from '~/types/Track'
import { CloudAlbumFile } from '~/types/Album'
import { CloudLib } from '~/lib/cloud.lib'
import { AlbumListDTO, AlbumSingleDTO } from '~/dtos/album.dto'

class AlbumsServices {
  async list(req: Request): Promise<AlbumListDTO> {
    const populate: Populate[] = [
      { path: 'artist', select: ['title'] },
      { path: 'genre', select: ['title'] },
      { path: 'period', select: ['title'] },
      { path: 'inCollections', select: ['title'] }
    ]
    const options: PaginatedPageBasicOptions = {
      page: req.body.page,
      limit: req.body.limit,
      sort: req.body.sort,
      populate,
      lean: true,
      select: { title: true, albumCover: true }
    }

    const dbList = await Album.paginate({}, options)

    if (dbList) {
      const coveredAlbums = await CloudLib.covers(dbList.docs)
      return new AlbumListDTO(dbList, coveredAlbums)
    }

    throw ApiError.BadRequest('Incorrect request options')
  }

  async single(id: string): Promise<AlbumSingleDTO> {
    const dbSingle = await Album.findById(id)
      .populate({ path: 'artist', select: ['title'] })
      .populate({ path: 'genre', select: ['title'] })
      .populate({ path: 'period', select: ['title'] })
      .populate({ path: 'tracks', populate: { path: 'artist', select: ['title'] } })
      .lean()

    if (dbSingle) {
      const albumCover = await CloudLib.getImageLink(Number(dbSingle.albumCover))
      const tracks = await CloudLib.tracks(dbSingle.tracks as unknown as TrackModel[])

      return new AlbumSingleDTO(dbSingle, albumCover, tracks)
    }

    throw ApiError.BadRequest('Incorrect request options')
  }

  async description(_id: string, description: string): Promise<ResponseMessage> {
    const $set = { description }
    await Album.updateOne({ _id }, { $set })
    return { message: 'Description updated' }
  }

  async booklet(id: string): Promise<(string | number)[]> {
    const folderQuery = CloudLib.cloudQueryLink(`listfolder?folderid=${id}`)
    const listFolder = await CloudLib.getData(folderQuery)
    const fileContents: CloudAlbumFile[] = listFolder.data.metadata.contents
    const preparedData = fileContents.map((el) => ({ albumCover: el.fileid }))
    const albumCovers = await CloudLib.covers(preparedData)

    return albumCovers.map((el) => el.albumCover)
  }
}

export default new AlbumsServices()
