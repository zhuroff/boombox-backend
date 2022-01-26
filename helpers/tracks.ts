import { fetchers } from './fetchers'
import { TrackModel } from '~/types/Track'

const getTracksLinks = async (tracks: TrackModel[]) => {
  const result = tracks.map(async (el) => {
    const query = fetchers.cloudQueryLink(`getfilelink?fileid=${el.fileid}`)
    const track = await fetchers.getData(query)

    el.link = `https://${track.data.hosts[0]}${track.data.path}`
    return el
  })

  return await Promise.all(result)
}

export default getTracksLinks
