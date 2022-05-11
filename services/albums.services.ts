import 'module-alias/register'
import { Request } from 'express'
import { ApiError } from '~/exceptions/api-errors'
import { Album } from '~/models/album.model'
import { CloudLib } from '~/lib/cloud.lib'
import { AlbumResponse, AlbumPageResponse, CloudAlbumFile } from '~/types/Album'
import { PaginationOptions, Populate, ResponseMessage } from '~/types/ReqRes'
import { AlbumItemDTO, AlbumSingleDTO } from '~/dtos/album.dto'
import { PaginationDTO } from '~/dtos/pagination.dto'
import { TrackDTO } from '~/dtos/track.dto'
import { Document, PaginateResult } from 'mongoose'

class AlbumsServices {
  async list(req: Request): Promise<AlbumPageResponse> {
    const populate: Populate[] = [
      { path: 'artist', select: ['title'] },
      { path: 'genre', select: ['title'] },
      { path: 'period', select: ['title'] },
      { path: 'inCollections', select: ['title'] }
    ]

    const options: PaginationOptions = {
      page: req.body.page,
      limit: req.body.limit,
      sort: req.body.sort,
      populate,
      lean: true,
      select: { title: true, albumCover: true }
    }

    const dbList: PaginateResult<Document<{}, {}, AlbumResponse>> = await Album.paginate<PaginationOptions>({}, options)

    if (dbList) {
      const { totalDocs, totalPages, page } = dbList
      const pagination = new PaginationDTO({ totalDocs, totalPages, page })

      const dbDocs = dbList.docs as unknown as AlbumResponse[]
      const coveredAlbums = await CloudLib.covers(dbDocs)
      const docs = coveredAlbums.map((album) => new AlbumItemDTO(album))

      return { docs, pagination }
    }

    throw ApiError.BadRequest('Incorrect request options')
  }

  async single(id: string): Promise<AlbumSingleDTO> {
    const dbSingle: AlbumResponse = await Album.findById(id)
      .populate({ path: 'artist', select: ['title'] })
      .populate({ path: 'genre', select: ['title'] })
      .populate({ path: 'period', select: ['title'] })
      .populate({ path: 'tracks', populate: { path: 'artist', select: ['title'] } })
      .lean()

    const dbSingleTracks = dbSingle.tracks

    if (dbSingle) {
      const albumCover = await CloudLib.getImageLink(Number(dbSingle.albumCover))
      const tracks: TrackDTO[] = await CloudLib.tracks(dbSingleTracks)

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
    const listFolder = await CloudLib.get(folderQuery)
    const fileContents: CloudAlbumFile[] = listFolder.data.metadata.contents
    const preparedData = fileContents.map((el) => ({ albumCover: el.fileid }))
    const albumBooklet = await CloudLib.covers(preparedData)

    return albumBooklet.map((el) => el.albumCover)
  }
}

export default new AlbumsServices()
