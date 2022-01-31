import 'module-alias/register'
import { Request, Response } from 'express'
import { Collection } from '~/models/collection.model'
import { getAlbumsWithCover } from '~/helpers/covers'

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
        select: ['title']
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
      deletedAlbums.map(async (album) => await removeItemFromCollection(album))
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

const appendAlbumToCollection = async (payload: any) => {
  try {
    const targetCollection = await Collection.findById(payload.listID).exec()

    if (targetCollection) {
      const updatedAlbums = [
        ...targetCollection.albums,
        {
          album: payload.itemID,
          order: targetCollection.albums.length + 1
        }
      ]

      await Collection.updateOne({ _id: payload.listID }, { $set: { albums: updatedAlbums } })
    }
  } catch (error) {
    throw error
  }
}

const removeItemFromCollection = async (payload: any) => {
  try {
    const targetCollection = await Collection.findById(payload.listID).exec()

    if (targetCollection) {
      const updatedAlbums = targetCollection.albums
        .filter((el) => el._id.toString() !== payload.itemID.toString())
        .map((el, index) => { el.order = index + 1; return el })
      await Collection.updateOne({ _id: payload.listID }, { $set: { albums: updatedAlbums } })
    }
  } catch (error) {
    throw error
  }
}

const removeAlbumFromCollection = async (payload: any) => {
  try {
    const targetCollection = await Collection.findById(payload.listID).exec()

    if (targetCollection) {
      const updatedAlbums = targetCollection.albums
        .filter((el) => el.album.toString() !== payload.itemID.toString())
        .map((el, index) => { el.order = index + 1; return el })
      await Collection.updateOne({ _id: payload.listID }, { $set: { albums: updatedAlbums } })
    }
  } catch (error) {
    throw error
  }
}

const update = async (req: Request, res: Response) => {
  try {
    if (req.body.isSave) {
      await appendAlbumToCollection(req.body)
      res.status(201).json({ message: 'Album successfully added to collection' })
    } else {
      await removeAlbumFromCollection(req.body)
      res.status(201).json({ message: 'Album successfully removed from collection' })
    }
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
