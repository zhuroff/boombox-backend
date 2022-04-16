import 'module-alias/register'
import { Request, Response } from 'express'
import { Collection } from '~/models/collection.model'
import collectionsServices from '~/services/collections.services'

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

  static async update(req: Request, res: Response, next: (error: unknown) => void) {
    const { listID, inList, itemID, order } = req.body

    try {
      const response = await collectionsServices.update({ listID, inList, itemID, order })
      res.status(201).json(response)
    } catch (error) {
      next(error)
    }
  }
}

// const create = async (req: Request, res: Response) => {
//   try {
//     const payload = {
//       title: req.body.title,
//       albums: [{
//         album: req.body.album,
//         order: 1
//       }]
//     }
//     const newCollection = new Collection(payload)
    
//     await newCollection.save()
//     await updateAlbum(newCollection._id, req.body.album, false)
    
//     res.status(201).json({ message: 'Collection successfully created' })
//   } catch (error) {
//     res.status(500).json(error)
//   }
// }

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

const remove = async (req: Request, res: Response) => {
  try {
    await Collection.deleteOne({ _id: req.params['id'] })
    res.status(201).json({ message: 'Collection successfully removed' })
  } catch (error) {
    res.status(500).json(error)
  }
}

const controller = {
  remove
}

export default controller
