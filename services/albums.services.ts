import { Request } from 'express'
import { AlbumListDTO } from '~/dtos/album.dto'
import { ApiError } from '~/exceptions/api-errors'
import { getAlbumsWithCover, getImageLink } from '~/helpers/covers'
import { fetchers } from '~/helpers/fetchers'
import getTracksLinks from '~/helpers/tracks'
import { CoversLib } from '~/lib/covers.lib'
import { Album } from '~/models/album.model'
import { CloudAlbumFile } from '~/types/Album'
import { PaginatedPageBasicOptions } from '~/types/ReqRes'
import { TrackModel } from '~/types/Track'

class AlbumsServices {
  async list(req: Request) {
    const populate = [
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
      const coveredAlbums = await CoversLib.covers(dbList.docs)
      return new AlbumListDTO(dbList, coveredAlbums)
    }

    throw ApiError.BadRequest('Incorrect request options')
  }

  async single(id: string) {
    const dbSingle = await Album.findById(id)
      .populate({ path: 'artist', select: ['title'] })
      .populate({ path: 'genre', select: ['title'] })
      .populate({ path: 'period', select: ['title'] })
      .populate({ path: 'tracks', populate: { path: 'artist', select: ['title'] } })
      .lean()

    if (dbSingle) {
      return {
        ...dbSingle,
        albumCover: await getImageLink(Number(dbSingle.albumCover)),
        tracks: await getTracksLinks(dbSingle.tracks as unknown as TrackModel[])
      }
    }

    throw new Error()
  }

  async description(_id: string, $set: any) {
    await Album.updateOne({ _id }, { $set })
    return { message: 'Description updated' }
  }

  async booklet(id: string) {
    const folderQuery = fetchers.cloudQueryLink(`listfolder?folderid=${id}`)
    const listFolder = await fetchers.getData(folderQuery)
    const fileContents: CloudAlbumFile[] = listFolder.data.metadata.contents
    const preparedData = fileContents.map((el) => ({ albumCover: el.fileid }))
    const booklet = await getAlbumsWithCover(preparedData)

    return booklet
  }
}

export default new AlbumsServices()
