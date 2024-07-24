import { Artist } from '../models/artist.model'
import { Genre } from '../models/genre.model'
import { Period } from '../models/period.model'
import { Collection } from '../models/collection.model'
import { Compilation } from '../models/compilation.model'

export const cleanEverything = async () => {
  try {
    await Artist.updateMany({}, { $set: { albums: [] } })
    await Genre.updateMany({}, { $set: { albums: [] } })
    await Period.updateMany({}, { $set: { albums: [] } })
    await Collection.updateMany({}, { $set: { albums: [] } })
    await Compilation.updateMany({}, { $set: { tracks: [] } })
  } catch (error) {
    throw error
  }
}
