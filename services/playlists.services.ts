import { PlaylistItemDTO } from '~/dtos/playlist.dto'
import { ApiError } from '~/exceptions/api-errors'
import { Playlist } from '~/models/playlist.model'

class PlaylistsServices {
  async list() {
    const config = { title: true, tracks: true, poster: true }
    const response = await Playlist.find({}, config).sort({ title: 1 }).exec()

    if (response) {
      return response.map((el) => new PlaylistItemDTO(el))
    }

    throw ApiError.BadRequest('Incorrect request options')
  }
}

export default new PlaylistsServices()
