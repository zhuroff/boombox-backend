import { Types } from 'mongoose'
import { PlaylistItemDTO } from '~/dtos/playlist.dto'
import { ApiError } from '~/exceptions/api-errors'
import { CloudLib } from '~/lib/cloud.lib'
import { Playlist } from '~/models/playlist.model'
import { Track } from '~/models/track.model'
import { CollectionReorder } from '~/types/Collection'
import { PlayListCreatePayload, PlayListUpdatePayload, PlaylistResponse } from '~/types/Playlist'
import { ResponseMessage } from '~/types/ReqRes'

class PlaylistsServices {
  async create({ title, track }: PlayListCreatePayload): Promise<ResponseMessage> {
    const payload = {
      title,
      tracks: [{ track, order: 1 }]
    }
    
    const newPlaylist = new Playlist(payload)

    await newPlaylist.save()
    await this.updateTrack(newPlaylist._id, track, false)

    return { message: 'Playlist successfully created' }
  }

  async update({ _id, inList, track, order }: PlayListUpdatePayload): Promise<ResponseMessage> {
    const query = { _id }
    const update = inList
      ? { $pull: { tracks: { track } } }
      : { $push: { tracks: { track, order } } }
    const options = { new: true }

    await Playlist.findOneAndUpdate(query, update, options)
    await this.updateTrack(_id, track, inList)

    return {
      message: inList
        ? 'Track successfully removed from playlist'
        : 'Track successfully added to playlist'
    }
  }

  async list() {
    const config = { title: true, tracks: true, avatar: true }
    const response = await Playlist.find({}, config).sort({ title: 1 }).exec()

    if (response) {
      return response.map((el) => new PlaylistItemDTO(el))
    }

    throw ApiError.BadRequest('Incorrect request options')
  }

  async single(id: string) {
    const response: PlaylistResponse = await Playlist.findById(id)
      .populate({
        path: 'tracks.track',
        select: ['title', 'listened', 'duration', 'fileid'],
        populate: [
          {
            path: 'artist',
            select: ['title']
          },
          {
            path: 'inAlbum',
            select: ['title', 'albumCover'],
            options: { lean: true },
            populate: [
              { path: 'period', select: ['title'] },
              { path: 'genre', select: ['title'] }
            ]
          }
        ]
      })
      .lean()
    
    if (response) {
      const preparedTracks = response.tracks.map(async (el) => {
        const cover = await CloudLib.getImageLink(Number(el.track.inAlbum.albumCover))
        const link = await CloudLib.tracks([el.track])

        return {
          order: el.order,
          ...{
            ...el.track,
            link: link[0]?.link,
            inAlbum: {
              ...el.track.inAlbum,
              albumCover: cover
            }
          }
        }
      })

      return {
        ...response,
        tracks: await Promise.all(preparedTracks)
      }
    }

    throw ApiError.BadRequest('Incorrect request options')
  }

  async reorder({ oldOrder, newOrder }: CollectionReorder, _id: string): Promise<ResponseMessage> {
    const targetPlaylist = await Playlist.findById(_id).exec()
    
    if (targetPlaylist) {
      targetPlaylist.tracks.splice(
        newOrder, 0,
        ...targetPlaylist.tracks.splice(oldOrder, 1)
      )

      targetPlaylist.tracks.forEach((el, index) => {
        el.order = index + 1
      })

      await Playlist.updateOne({ _id }, { $set: { tracks: targetPlaylist.tracks } })

      return { message: 'Order successfully updated' }
    }

    throw ApiError.BadRequest('Incorrect request options')
  }

  async updateTrack(listID: Types.ObjectId | string, trackID: string, inList: boolean) {
    const query = { _id: trackID }
    const update = inList
      ? { $pull: { inPlaylists: listID } }
      : { $push: { inPlaylists: listID } }
    const options = { new: true }

    await Track.findOneAndUpdate(query, update, options)
  }
}

export default new PlaylistsServices()
