import 'module-alias/register'
import { Request } from 'express'
import { ApiError } from '~/exceptions/api-errors'
import { Album } from '~/models/album.model'
import { CloudLib } from '~/lib/cloud.lib'
import { AlbumResponse } from '~/types/Album'
import { PaginationOptions, Populate } from '~/types/ReqRes'
import { AlbumItemDTO, AlbumSingleDTO } from '~/dtos/album.dto'
import { PaginationDTO } from '~/dtos/pagination.dto'
import { TrackDTO } from '~/dtos/track.dto'
import { CloudFile, CloudFolder } from '~/types/Cloud'
import { sanitizeURL } from '~/controllers/synchronize.controller'

class AlbumsServices {
  async list(req: Request) {
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

  async single(id: string) {
    const dbSingle: AlbumResponse = await Album.findById(id)
      .populate({ path: 'artist', select: ['title'] })
      .populate({ path: 'genre', select: ['title'] })
      .populate({ path: 'period', select: ['title'] })
      .populate({
        path: 'tracks',
        populate: [
          { path: 'artist', select: ['title'] },
          { path: 'inAlbum', select: ['title'] }
        ]
      })
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

  async description(_id: string, description: string) {
    const $set = { description }
    await Album.updateOne({ _id }, { $set })
    return { message: 'Description updated' }
  }

  async booklet(path: string) {
    const bookletRes = await CloudLib.get<CloudFolder>(sanitizeURL(path))
    return bookletRes.data._embedded.items.map((item) => 'file' in item && item.file)
  }

  async undisposed(path: string, id?: string) {
    const response = await CloudLib.get<CloudFolder>(sanitizeURL(path))
    let ddd

    if (typeof id !== 'undefined') {
      const ttt = response.data._embedded.items.map(async (el) => {
        if (el.type === 'dir') {
          const xxx = await CloudLib.get<CloudFolder>(sanitizeURL(el.path))
          return xxx.data._embedded.items.map((el) => ({ ...el, album: response.data.name, artist: response.data.path }))
        }
        return { ...el, album: response.data.name, artist: response.data.path }
      })

      ddd = await Promise.all(ttt)
      console.log(ddd)
      const tracks = ddd
        .flat()
        .filter((track) => 'media_type' in track && track.media_type === 'audio')
        .map((track) => ({
          _id: track.resource_id,
          title: track.name,
          link: 'file' in track && track.file,
          artist: { _id: track.resource_id.split(':')[0], title: 'artist' in track && track.artist },
          inAlbum: { _id: track.resource_id.split(':')[1], title: track.album }
        }))

      return { _id: id, tracks }
    } else {
      return response.data._embedded.items
    }
  }
}

export default new AlbumsServices()
