import 'module-alias/register'
import { Request, Response } from 'express'
import { Collection } from '~/models/collection.model'
import { Album } from '~/models/album.model'
import collectionsServices from '~/services/collections.services'
// import { getAlbumsWithCover } from '~/helpers/covers'

export class CollectionsController {
  static async list(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await collectionsServices.list()
      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async single(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await collectionsServices.single(String(req.params['id']))
      res.json(response)
    } catch (error) {
      next(error)
    }
  }
}

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
    
    res.status(201).json({ message: 'Collection successfully created' })
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

    res.status(201).json({
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
  update,
  remove
}

export default controller
