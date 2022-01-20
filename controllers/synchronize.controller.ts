import 'module-alias/register'
import { Request, Response } from 'express'
import { PaginateModel } from 'mongoose'
import { fetchers } from '~/helpers/fetchers'
import { Album } from '~/models/album.model'
import { Artist } from '~/models/artist.model'
import { Genre } from '~/models/genre.model'
import { Period } from '~/models/period.model'
import {
  CloudAlbum,
  CloudAlbumFolder,
  CloudAlbumFile,
  CloudAlbumTrack,
  CloudAlbumContent,
  AlbumModel,
  AlbumTracksModel,
  AlbumModelDocument
} from '~/types/Album'

const syncSuccess = { status: 201, message: 'Successfully synchronized' }

const getAlbumCover = (array: CloudAlbumFile[]) => {
  const coverFile = array.find((content) => (
    content.contenttype && content.contenttype.includes('image')
  ))
  return coverFile ? coverFile.fileid : 0
}

const getAlbumCoverArt = (array: CloudAlbumFolder[]) => {
  const coverArt = array.find((content) => content.name === 'booklet')
  return coverArt ? coverArt.folderid : 0
}

const getAlbumTracks: any = async (array: CloudAlbumContent[]) => {
  const albumParts = array.filter((el) => (
    el.isfolder && el.name !== 'booklet'
  )) as CloudAlbumFolder[]

  if (albumParts.length) {
    const subFoldersContent = albumParts.map(async (el) => {
      const query = fetchers.cloudQueryLink(`listfolder?folderid=${el.folderid}`)
      const elTracks = await fetchers.getData(query)
      
      return elTracks.data.metadata.contents
    })

    const content = await Promise.all(subFoldersContent)

    return getAlbumTracks(content.flat())
  } else {
    const modifiedArray = (array as CloudAlbumTrack[])
      .filter((el) => el.contenttype && el.contenttype.includes('audio'))
      .map((el) => {
        const splitName = el.name.split('.')
        splitName.shift()
        splitName.pop()
        el.title = splitName.join('.').trim()

        return el
      })

    return modifiedArray
  }
}

const createOrUpdateCategory = async (...args: [PaginateModel<any>, string, AlbumModelDocument]) => {
  const [Model, title, album] = args
  const query = { title: title }
  const update = { $push: { albums: album._doc._id } }
  const options = { upsert: true, new: true, setDefaultsOnInsert: true }

  await Model.findOneAndUpdate(query, update, options)
}

const saveDatabaseEntries = async (album: AlbumModel) => {
  const { artistTitle, genreTitle, periodYear } = album
  const newAlbum = new Album(album)

  try {
    const dbAlbum = await newAlbum.save()

    await createOrUpdateCategory(
      Artist,
      artistTitle || 'unknown artist',
      dbAlbum
    )

    await createOrUpdateCategory(
      Genre,
      genreTitle || 'unknown genre',
      dbAlbum
    )

    await createOrUpdateCategory(
      Period,
      periodYear || 'unknown year',
      dbAlbum
    )

    return syncSuccess
  } catch (error) {
    throw error
  }
}

const createDatabaseEntries = async (albums: AlbumModel[]) => {
  try {
    const dbCreating = albums.map(async (album) => (
      await saveDatabaseEntries(album)
    ))

    return await Promise.all(dbCreating)
  } catch (error) {
    return error
  }
}

const getAlbumTitle = (name: string) => {
  const albumTitleRegExp = /\]([^)]+)\#/
  const albumTitle = albumTitleRegExp.exec(name)
  const albumTitleResult = albumTitle && albumTitle[1] ? albumTitle[1].trim() : 'unknown album'

  return albumTitleResult
}

const getArtistName = (name: string) => {
  const albumArtist = name.split('\[')[0]
  const artistTitleResult = albumArtist ? albumArtist.trim() : 'unknown artist'

  return artistTitleResult
}

const getAlbumGenre = (name: string) => {
  const albumGenre = name.split('#')[1]
  return albumGenre || 'unknown genre'
}

const getAlbumReleaseYear = (name: string) => {
  const albumYearRegExp = /\[([^)]+)\]/
  const albumYear = albumYearRegExp.exec(name)
  const albumYearResult = albumYear && albumYear[1] ? albumYear[1] : 'unknown year'

  return albumYearResult
}

const buildAlbumsData = async (content: CloudAlbum[], isModified = false) => {
  try {
    const albumsMap = content.map(async (el: CloudAlbum) => {
      const folderQuery = fetchers.cloudQueryLink(`listfolder?folderid=${el.folderid}`)
      const listFolder = await fetchers.getData(folderQuery)
      const folderTracks: AlbumTracksModel[] = await getAlbumTracks(listFolder.data.metadata.contents)
      
      const pcloudData: AlbumModel = {
        title: getAlbumTitle(el.name),
        artistTitle: getArtistName(el.name),
        genreTitle: getAlbumGenre(el.name),
        periodYear: getAlbumReleaseYear(el.name),
        albumCover: getAlbumCover(listFolder.data.metadata.contents),
        albumCoverArt: getAlbumCoverArt(listFolder.data.metadata.contents),
        folderid: el.folderid,        
        modified: el.modified,
        description: '',
        tracks: folderTracks
      }

      return pcloudData
    })

    const albums = await Promise.all(albumsMap)

    // if (isModified) {
    //   return modifyAlbumsInDataBase(albums)
    // }
    
    return createDatabaseEntries(albums)
  } catch (error) {
    console.log(error)
  }
}

const updateDatabaseEntries = (cloudAlbums: CloudAlbum[], dbAlbums: AlbumModel[]) => {
  const albumsToAdd = [] as unknown as any[]
  const albumsToDel = [] as unknown as any[]
  const albumsToFix = [] as unknown as any[]

  cloudAlbums.forEach((cloudAlbum) => {
    const matched = dbAlbums.find((dbAlbum) => (
      dbAlbum.folderid === cloudAlbum.folderid
    ))

    if (matched) {
      matched.toStay = true

      const dbModifiedDate = new Date(matched.modified).getTime()
      const cloudModifiedDate = new Date(cloudAlbum.modified).getTime()

      if (dbModifiedDate !== cloudModifiedDate) {
        albumsToFix.push({
          old: matched,
          new: cloudAlbum
        })
      }
    } else {
      albumsToAdd.push(cloudAlbum)
    }
  })

  albumsToDel.push(...dbAlbums.filter((el) => !el.toStay))
}

const synchronizeHandler = async (cloudAlbums: CloudAlbum[]) => {
  const searchConfig = {
    modified: true,
    folderid: true,
    artist: true,
    genre: true,
    period: true
  }

  const dbAlbums = await Album.find({}, searchConfig).exec()

  if (!dbAlbums.length) {
    return buildAlbumsData(cloudAlbums)
  }

  return updateDatabaseEntries(cloudAlbums, dbAlbums)
}

const synchronize = async (req: Request, res: Response) => {
  const query = fetchers.cloudQueryLink('listfolder?path=/boombox')

  try {
    const rootFolder = await fetchers.getData(query)
    const cloudContent = rootFolder.data.metadata.contents

    if (!cloudContent.length) {
      return res.json({
        type: 'warning',
        message: 'Your cloud collection is empty'
      })
    }

    if (rootFolder.data.result !== 0) {
      return res.status(500).json(rootFolder.data)
    }

    await synchronizeHandler(cloudContent)
    //res.json(result)
    res.json({ message: '1' })
  } catch (error) {
    res.status(500).json(error)
  }
}

const controller = {
  synchronize
}

export default controller
