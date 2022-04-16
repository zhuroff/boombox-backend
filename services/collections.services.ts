import { ApiError } from '~/exceptions/api-errors'
import { CloudLib } from '~/lib/cloud.lib'
import { Collection } from '~/models/collection.model'
import { Album } from '~/models/album.model'
import { AlbumResponse } from '~/types/Album'
import { ResponseMessage } from '~/types/ReqRes'
import {
  CollectionListItem,
  CollectionModelAlbum,
  CollectionReorder,
  CollectionUpdateProps,
  DeletedCollectionAlbum
} from '~/types/Collection'

class CollectionsServices {
  async create(title: string, album: string) {
    const payload = {
      title: title,
      albums: [{
        album: album,
        order: 1
      }]
    }
    
    const newCollection = new Collection(payload)

    await newCollection.save()
    await this.updateAlbum({ listID: newCollection._id, itemID: album, inList: false })

    return { message: 'Collection successfully created' }
  }

  async remove(_id: string) {
    const response = await Collection.findByIdAndDelete(_id)
    
    if (response) {
      await this.cleanAlbums(response.albums, _id)
      return { message: 'Collection successfully removed' }
    }

    throw ApiError.BadRequest('Incorrect request options')
  }

  async list() {
    const config = { title: true, cover: true, 'albums.order': true }
    const response = await Collection.find({}, config)
      .populate({
        path: 'albums.album',
        select: ['_id']
      })

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

    let existingAlbums: CollectionListItem[] = []
    let deletedAlbums: DeletedCollectionAlbum[] = []

    response.albums.forEach((el) => {
      if (el.album) {
        existingAlbums.push({ ...el, album: el.album as AlbumResponse })
      } else {
        deletedAlbums.push({
          listID: id,
          itemID: el._id
        })
      }
    })

    existingAlbums.sort((a, b) => {
      if (a.order < b.order) return -1
      if (a.order > b.order) return 1
      return 0
    })
    
    if (deletedAlbums.length) {
      console.log('Album was deleted!!!')
      // deletedAlbums.map(async (album) => await removeItemFromCollection(album))
    }
    
    const coveredAlbums = existingAlbums.length
      ? existingAlbums.map(async (el) => {
          const coveredAlbum = await CloudLib.covers([el.album])
          return { ...el, album: coveredAlbum[0] }
        })
      : []

    const result = {
      _id: response._id,
      title: response.title,
      albums: await Promise.all(coveredAlbums)
    }

    return result
  }

  async update({ listID, inList, itemID, order }: CollectionUpdateProps) {
    const query = { _id: listID }
    const update = inList
      ? { $pull: { albums: { album: itemID } } }
      : { $push: { albums: { album: itemID, order } } }
    const options = { new: true }

    await Collection.findOneAndUpdate(query, update, options)
    await this.updateAlbum({ listID, itemID, inList })

    return {
      message: inList
        ? 'Album successfully removed from collection'
        : 'Album successfully added to collection'
    } as ResponseMessage
  }

  async reorder({ oldOrder, newOrder }: CollectionReorder, id: string) {
    const targetCollection = await Collection.findById(id).exec()

    if (targetCollection) {
      targetCollection.albums.splice(
        newOrder, 0,
        ...targetCollection.albums.splice(oldOrder, 1)
      )

      targetCollection.albums.forEach((el, index) => {
        el.order = index + 1
      })

      await Collection.updateOne({ _id: id }, { $set: { albums: targetCollection.albums } })

      return { message: 'Order successfully changed' }
    }
  }

  async updateAlbum({listID, itemID, inList}: Partial<CollectionUpdateProps>) {
    try {
      const query = { _id: itemID }
      const update = inList
        ? { $pull: { inCollections: listID } }
        : { $push: { inCollections: listID } }
      const options = { new: true }
  
      await Album.findOneAndUpdate(query, update, options)
    } catch (error) {
      throw error
    }
  }

  async cleanAlbums(albums: CollectionModelAlbum[], listID: string) {
    const cleanProcess = albums.map(async (album) => {
      const query = { _id: album.album }
      const update = { $pull: { inCollections: listID } }
      const options = { new: true }
      
      return await Album.findOneAndUpdate(query, update, options)
    })

    return await Promise.all(cleanProcess)
  }
}

export default new CollectionsServices()
