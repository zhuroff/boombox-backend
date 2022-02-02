import 'module-alias/register'
import { Request, Response } from 'express'
import { Collection } from '~/models/collection.model'
import { Album } from '~/models/album.model'
import { getAlbumsWithCover } from '~/helpers/covers'

const updateAlbum = async (collectionID: string, albumID: string, inList: boolean) => {
  try {
    const query = { _id: albumID }
    const update = inList
      ? { $pull: { inCollections: collectionID } }
      : { $push: { inCollections: collectionID } }
    const options = { new: true }

    await Album.findOneAndUpdate(query, update, options)
  } catch (error) {
    throw error
  }
}

const create = async (req: Request, res: Response) => {
  try {
    const payload = {
      title: req.body.title,
      albums: [{
        album: req.body.album,
        order: 1
      }]
    }
    const newCollection = new Collection(payload)
    
    await newCollection.save()
    await updateAlbum(newCollection._id, req.body.album, false)
    
    res.json({ message: 'Collection successfully created' })
  } catch (error) {
    res.status(500).json(error)
  }
}

const list = async (req: Request, res: Response) => {
  try {
    const config = { title: true, cover: true, 'albums.order': true } 
    const response = await Collection.find({}, config)
      .populate({
        path: 'albums.album',
        select: ['_id']
      })
      .sort({ 'albums.order': -1 })

    res.json(response)
  } catch (error) {
    res.status(500).json(error)
  }
}

const single = async (req: Request, res: Response) => {
  try {
    const response = await Collection.findById(req.params['id'])
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
          listID: req.params['id'],
          itemID: el._id
        })
      }
    })
    
    if (deletedAlbums.length) {
      console.log('Album was deleted!!!')
      // deletedAlbums.map(async (album) => await removeItemFromCollection(album))
    }
    
    const coveredAlbums = await getAlbumsWithCover(existingAlbums.map((el) => {
      if (el.album) {
        el.album.order = el.order
        return el.album
      }
    }))

    const result = {
      _id: response._id,
      title: response.title,
      albums: coveredAlbums
    }

    res.json(result)
  } catch (error) {
    res.status(500).json(error)
  }
}

// const removeItemFromCollection = async (payload: any) => {
//   try {
//     const targetCollection = await Collection.findById(payload.listID).exec()

//     if (targetCollection) {
//       const updatedAlbums = targetCollection.albums
//         .filter((el) => el._id.toString() !== payload.itemID.toString())
//         .map((el, index) => { el.order = index + 1; return el })
//       await Collection.updateOne({ _id: payload.listID }, { $set: { albums: updatedAlbums } })
//     }
//   } catch (error) {
//     throw error
//   }
// }

const update = async (req: Request, res: Response) => {
  try {
    const query = { _id: req.body['listID'] }
    const update = req.body['inList']
      ? { $pull: { albums: { album: req.body['itemID'] } } }
      : { $push: { albums: { album: req.body['itemID'], order: req.body['order'] } } }
    const options = { new: true }

    await Collection.findOneAndUpdate(query, update, options)
    await updateAlbum(req.body['listID'], req.body['itemID'], req.body['inList'])

    res.json({
      message: req.body['inList']
        ? 'Album successfully removed from collection'
        : 'Album successfully added to collection'
    })
  } catch (error) {
    res.status(500).json(error)
  }
}

const remove = async (req: Request, res: Response) => {
  try {
    await Collection.deleteOne({ _id: req.params['id'] })
    res.status(201).json({ message: 'Collection successfully removed' })
  } catch (error) {
    res.status(500).json(error)
  }
}

const controller = {
  create,
  list,
  single,
  update,
  remove
}

export default controller
