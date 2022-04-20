import 'module-alias/register'
import { Request, Response } from 'express'
import { PlayListUpdatePayload } from '~/types/Playlist'
import playlistsServices from '~/services/playlists.services'

export class PlaylistsController {
  static async create(req: Request, res: Response, next: (error: unknown) => void) {
    const { title, track } = req.body

    try {
      const response = await playlistsServices.create({ title, track })
      res.status(201).json(response)
    } catch (error) {
      next(error)
    }
  }

  static async update(req: Request, res: Response, next: (error: unknown) => void) {
    const payload: PlayListUpdatePayload = {
      _id: String(req.body['listID']),
      inList: req.body['inList'],
      track: req.body['itemID'],
      order: req.body['order']
    }

    try {
      const response = await playlistsServices.update(payload)
      res.status(201).json(response)
    } catch (error) {
      next(error)
    }
  }

  static async list(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await playlistsServices.list()
      res.json(response)
    } catch (error) {
      next(error)
    }
  }

  static async single(req: Request, res: Response, next: (error: unknown) => void) {
    try {
      const response = await playlistsServices.single(String(req.params['id']))
      res.json(response)
    } catch (error) {
      next(error)
    }
  }
}

// import { getAlbumsWithCover } from '~/helpers/covers'
// import path, { dirname } from 'path'
// import { fileURLToPath } from 'url'
// import fs from 'fs'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = dirname(__filename)

// const buildPlaylistTracks = async (tracks: any) => {
//   const result = tracks.map(async (el) => {
//     const album = await getAlbumsWithCover([{ ...el.album }])

//     // REPLACE WITH CloudLib.tracks
//     const link = await getTracksLinks([{ fileid: el.fileid }])

//     const track = album[0].tracks.find((track) => track._id.toString() === el.track.toString())

//     delete album[0].tracks

//     el.album = album[0]
//     el.trackID = track ? track._id : null
//     el.track = track ? track.title : 'Unknown track'
//     el.duration = track ? track.duration : null
//     el.fileid = track ? track.fileid : null
//     el.lyrics = track ? track.lyrics : null
//     el.link = link && link.length ? link[0].link : null
//     el.listened = track ? track.listened : null
    
//     return el
//   })

//   return await Promise.all(result)
// }

const changeOrder = async (req: Request, res: Response) => {
  // try {
  //   const targetPlaylist = await Playlist.findById(req.params.id).exec()

  //   targetPlaylist.tracks.splice(
  //     req.body.newOrder, 0,
  //     targetPlaylist.tracks.splice(req.body.oldOrder, 1)[0]
  //   )

  //   targetPlaylist.tracks.forEach((el, index) => {
  //     el.order = index + 1
  //   })

  //   await Playlist.updateOne({ _id: req.params.id }, { $set: { tracks: targetPlaylist.tracks } })
  //   res.status(201).json({ message: 'Tracks order successfully updated' })
  // } catch (error) {
  //   res.status(500).json(error)
  // }
}

const deletePlaylist = async (req: Request, res: Response) => {
  // try {
  //   if (req.body.cover) {
  //     fs.unlinkSync(path.join(__dirname, '../..', 'client', 'public', encodeURI(req.body.cover)))
  //   }
    
  //   await Playlist.deleteOne({ _id: req.params.id })
    
  //   res.status(201).json({ message: 'Playlist successfully removed' })
  // } catch (error) {
  //   res.status(500).json(error)
  // }
}

const upload = async (req: Request, res: Response) => {
  // try {
  //   const response = await Playlist.findOneAndUpdate({
  //     _id: req.params.id
  //   }, { $set: { poster: `/uploads/${req.file.filename}` } }, { new: true })
    
  //   res.json(response)
  // } catch (error) {
  //   res.status(500).json(error)
  // }
}

const controller = {
  changeOrder,
  deletePlaylist,
  upload
}

export default controller
