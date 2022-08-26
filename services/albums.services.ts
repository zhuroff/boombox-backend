import 'module-alias/register'
import { Request } from 'express'
import { ApiError } from '~/exceptions/api-errors'
import { Album } from '~/models/album.model'
import { CloudLib } from '~/lib/cloud.lib'
import { AlbumResponse, AlbumPageResponse } from '~/types/Album'
import { PaginationOptions, Populate, ResponseMessage } from '~/types/ReqRes'
import { AlbumItemDTO, AlbumSingleDTO } from '~/dtos/album.dto'
import { PaginationDTO } from '~/dtos/pagination.dto'
import { TrackDTO } from '~/dtos/track.dto'
import { CloudFile, CloudFolder } from '~/types/Cloud'

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

    const dbList = await Album.paginate({}, options)

    if (dbList) {
      const { totalDocs, totalPages, page } = dbList
      const pagination = new PaginationDTO({ totalDocs, totalPages, page })

      const dbDocs = dbList.docs as unknown as AlbumResponse[]
      const promisedDocs = dbDocs.map(async (album) => {
        const albumCoverRes = await CloudLib.get<CloudFile>(album.albumCover)
        return new AlbumItemDTO(album, albumCoverRes.data.file)
      })

      const docs = await Promise.all(promisedDocs)
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

    if (dbSingle) {
      const albumCoverRes = await CloudLib.get<CloudFile>(dbSingle.albumCover)
      const promisedTracks = dbSingle.tracks.map(async (track) => {
        const trackRes = await CloudLib.get<CloudFile>(track.path)
        return new TrackDTO({ ...track, ...trackRes.data })
      })
      const albumTracks = await Promise.all(promisedTracks)
      return new AlbumSingleDTO(dbSingle, albumCoverRes.data.file, albumTracks)
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
    const listFolder = await CloudLib.get<any>(folderQuery)
    const fileContents: CloudFolder[] = listFolder.data.metadata.contents
    const preparedData = fileContents.map((el) => ({ albumCover: el.path }))
    const albumBooklet = await CloudLib.covers(preparedData)

    return albumBooklet.map((el) => el.albumCover)
  }
}

export default new AlbumsServices()
