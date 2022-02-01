import 'module-alias/register'
import { Request, Response } from 'express'
import { Playlist } from '~/models/playlist.model'
// import { getAlbumsWithCover } from '~/helpers/covers'
// import getTracksLinks from '~/helpers/tracks'
// import path, { dirname } from 'path'
// import { fileURLToPath } from 'url'
// import fs from 'fs'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = dirname(__filename)

// const buildPlaylistTracks = async (tracks: any) => {
//   const result = tracks.map(async (el) => {
//     const album = await getAlbumsWithCover([{ ...el.album }])
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

const create = async (req: Request, res: Response) => {
  try {
    const payload = {
      title: req.body.title,
      tracks: [{
        track: req.body.track,
        order: 1
      }]
    }
    const newPlaylist = new Playlist(payload)

    await newPlaylist.save()

    res.json({ message: 'Playlist successfully created' })
  } catch(error) {
    res.status(500).json(error)
  }
}

const list = async (req: Request, res: Response) => {
  try {   
    const config = { title: true, tracks: true, poster: true } 
    const response = await Playlist.find({}, config).sort({ title: -1 })
    res.json(response)
  } catch (error) {
    res.status(500).json(error)
  }
}

const single = async (req: Request, res: Response) => {
  // try {
  //   Playlist.findById(req.params['id'])
  //     .populate({
  //       path: 'tracks',
  //       populate: [
  //         {
  //           path: 'artist',
  //           select: ['title']
  //         },

  //         {
  //           path: 'album',
  //           select: ['title', 'albumCover', 'period', 'tracks'],
  //           options: { lean: true }
  //         }
  //       ]
  //     })
  //     .lean()
  //     .exec(async (error, playlist) => {
  //       if (error) return res.status(500).json(error)

  //       const tracks = await buildPlaylistTracks(playlist.tracks)
  //       playlist.tracks = tracks
        
  //       res.json(playlist)
  //     })
  // } catch (error) {
  //   console.error(error)
  // }
}

const update = async (req: Request, res: Response) => {
  try {
    const query = { _id: req.body['listID'] }
    const update = req.body['inList']
      ? { $pull: { tracks: { track: req.body['itemID'] } } }
      : { $push: { tracks: { track: req.body['itemID'], order: req.body['order'] } } }
    const options = { new: true }

    await Playlist.findOneAndUpdate(query, update, options)

    res.json({
      message: req.body['listID']
        ? 'Track successfully added to playlist'
        : 'Track successfully removed from playlist'
    })
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}

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
  create,
  list,
  single,
  update,
  changeOrder,
  deletePlaylist,
  upload
}

export default controller
