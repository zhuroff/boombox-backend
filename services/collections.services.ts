import { ApiError } from '~/exceptions/api-errors'
import { Collection } from '~/models/collection.model'

class CollectionsServices {
  async list() {
    const config = { title: true, cover: true, 'albums.order': true }
    const response = await Collection.find({}, config)
      .populate({
        path: 'albums.album',
        select: ['_id']
      })
      .sort({ 'albums.order': -1 })

    if (response) {
      return response
    }

    throw ApiError.BadRequest('Incorrect request options')
  }

  async single(id: string) {
    const response = await Collection.findById(id)
      .populate({
        path: 'albums.album',
        select: ['title', 'artist', 'genre', 'period', 'albumCover'],
        populate: [
          { path: 'artist', select: ['title'] },
          { path: 'genre', select: ['title'] },
          { path: 'period', select: ['title'] }
        ]
      })
      .lean()

    let existingAlbums: any[] = []
    let deletedAlbums: any[] = []

    response.albums.forEach((el) => {
      if (el.album) {
        existingAlbums.push(el)
      } else {
        deletedAlbums.push({
          listID: id,
          itemID: el._id
        })
      }
    })
    
    if (deletedAlbums.length) {
      console.log('Album was deleted!!!')
      // deletedAlbums.map(async (album) => await removeItemFromCollection(album))
    }
    
    const coveredAlbums: any = []
    // const coveredAlbums = await getAlbumsWithCover(existingAlbums.map((el) => {
    //   if (el.album) {
    //     el.album.order = el.order
    //     return el.album
    //   }
    // }))

    const result = {
      _id: response._id,
      title: response.title,
      albums: coveredAlbums
    }

    return result
  }
}

export default new CollectionsServices()
