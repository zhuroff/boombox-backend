import 'module-alias/register'
import { Request, Response } from 'express'
import { fetchers } from '~/helpers/fetchers'
import { Album } from '~/models/album.model'
// import { Artist } from '~/models/artist.model'
// import { Genre } from '~/models/genre.model'
// import { Period } from '~/models/period.model'
import {
  CloudAlbum,
  CloudAlbumFolder,
  CloudAlbumFile,
  CloudAlbumTrack,
  CloudAlbumContent,
  AlbumModel,
  AlbumTracksModel
} from '~/types/Album'

const syncSuccess = { status: 201, message: 'Successfully synchronized' }
// const unspecifiedError = { status: 0, message: 'Unspecified error' }

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

// const swapCategories = (categories, key) => {
//   const swapped = categories.reduce((acc, next) => {
//     if (!acc.length) {
//       const category = {}

//       category[key] = next[key],
//       category.albums = [next.album]

//       acc.push(category)
//     } else {
//       const existingCategory = acc.findIndex((el) => el[key] === next[key])

//       if (existingCategory !== -1) {
//         acc[existingCategory].albums.push(next.album)
//       } else {
//         const category = {}

//         category[key] = next[key],
//         category.albums = [next.album]

//         acc.push(category)
//       }
//     }

//     return acc
//   }, [])

//   return swapped
// }

// const saveCategoryToDataBase = async (data, Model, key) => {
//   const dbCategoryList = await Model.find({}, { title: true, albums: true }).exec()

//   const categoriesCreating = data.map(async (el) => {
//     const existCategory = dbCategoryList.find((category) => category.title == el[key])

//     if (!existCategory) {
//       const newCategory = new Model({ title: el[key], albums: el.albums })

//       try {
//         const category = await newCategory.save()
//         return category
//       } catch (error) {
//         return error
//       }
//     } else {
//       try {
//         existCategory.albums = [...existCategory.albums, ...el.albums]
//         const category = await existCategory.save()
//         return category
//       } catch (error) {
//         return error
//       }
//     }
//   })

//   const result = await Promise.all(categoriesCreating)
//   return result
// }

const saveAlbumToDataBase = async (album: AlbumModel) => {
  const { artistName, genresArray, periodYear } = album

  const newAlbum = new Album(album)

  try {
    const dbAlbum = await newAlbum.save()
    return { ...dbAlbum, artistName, genresArray, periodYear }
  } catch (error) {
    console.log('saveAlbumToDataBase', error)
    throw error
  }
}

// const appendArtistsToAlbums = async (artists) => {
//   const albumArtistUpdating = artists.map(async (artist) => {
//     const albumUpdating = artist.albums.map(async (albumID) => {
//       return await Album.findByIdAndUpdate(albumID, { artist: artist._id })
//     })

//     return await Promise.all(albumUpdating)
//   })

//   return await Promise.all(albumArtistUpdating)
// }

// const appendGenresToAlbums = async (genres) => {
//   const albumGenreUpdating = genres.map(async (genre) => {
//     const albumUpdating = genre.albums.map(async (albumID) => {
//       return await Album.findByIdAndUpdate(albumID, { genre: genre._id })
//     })

//     return await Promise.all(albumUpdating)
//   })

//   return await Promise.all(albumGenreUpdating)
// }

// const appendPeriodsToAlbum = async (periods) => {
//   const albumPeriodUpdating = periods.map(async (period) => {
//     const albumUpdating = period.albums.map(async (albumID) => {
//       return await Album.findByIdAndUpdate(albumID, { period: period._id })
//     })

//     return await Promise.all(albumUpdating)
//   })

//   return await Promise.all(albumPeriodUpdating)
// }

const createDatabaseEntries = async (albums: AlbumModel[]) => {
  try {
    const dbCreating = albums.map(async (el) => await saveAlbumToDataBase(el))
    const createdAlbums = await Promise.all(dbCreating)
    console.log(createdAlbums)

    // const artists = createdAlbums.map((el) => {
    //   return { artist: el.artistName, album: el._id }
    // })

    // const genres = createdAlbums.map((el) => {
    //   return { genre: el.albumGenre, album: el._id }
    // })

    // const periods = createdAlbums.map((el) => {
    //   return { period: el.releaseYear, album: el._id }
    // })

    // const createdArtists = await saveCategoryToDataBase(
    //   swapCategories(artists, 'artist'),
    //   Artist, 'artist'
    // )

    // const createdGenres = await saveCategoryToDataBase(
    //   swapCategories(genres, 'genre'),
    //   Genre, 'genre'
    // )

    // const createdPeriods = await saveCategoryToDataBase(
    //   swapCategories(periods, 'period'),
    //   Period, 'period'
    // )

    // await appendArtistsToAlbums(createdArtists)
    // await appendGenresToAlbums(createdGenres)
    // await appendPeriodsToAlbum(createdPeriods)
    
    return syncSuccess
  } catch (error) {
    return error
  }
}

// const remainingAlbums = (a, b) => {
//   return a.filter(el => !b.includes(el)).concat(b.filter(el => !a.includes(el)))
// }

// const clearfyCategories = async (payload, Model) => {
//   try {
//     const category = await Model.findById(payload._id).exec()
//     const albums = remainingAlbums(
//       category.albums.map((el) => el.toString()),
//       payload.albums
//     )

//     if (!albums.length && !category.framesAlbums?.length) {
//       await Model.deleteOne({ _id: payload._id })
//     } else {
//       await Model.updateOne({ _id: payload._id }, { $set: { albums: albums } })
//     }
//   } catch (error) {
//     return error
//   }
// }

// const deleteAlbumFromDataBase = async (albumID) => {
//   try {
//     await Album.deleteOne({ _id: albumID })
//   } catch (error) {
//     return error
//   }
// }

// const deleteDatabaseEntries = async (albums) => {
//   try {
//     const artists = []
//     const genres = []
//     const periods = []

//     const deletedAlbums = albums.map(async (album) => {
//       await deleteAlbumFromDataBase(album._id)

//       const currentArtist = artists.find((el) => el._id.toString() === album.artist.toString())
//       const currentGenre = genres.find((el) => el._id.toString() === album.genre.toString())
//       const currentPeriod = periods.find((el) => el._id.toString() === album.period.toString())

//       if (!currentArtist) {
//         artists.push({
//           _id: album.artist,
//           albums: [album._id.toString()]
//         })
//       } else {
//         currentArtist.albums.push(album._id.toString())
//       }

//       if (!currentGenre) {
//         genres.push({
//           _id: album.genre,
//           albums: [album._id.toString()]
//         })
//       } else {
//         currentGenre.albums.push(album._id.toString())
//       }

//       if (!currentPeriod) {
//         periods.push({
//           _id: album.period,
//           albums: [album._id.toString()]
//         })
//       } else {
//         currentPeriod.albums.push(album._id.toString())
//       }
//     })

//     await Promise.all(deletedAlbums)

//     const deletedArtists = artists.map(async (artist) => {
//       await clearfyCategories(artist, Artist)
//     })

//     const deletedGenres = genres.map(async (genre) => {
//       await clearfyCategories(genre, Genre)
//     })

//     const deletedPeriods = periods.map(async (period) => {
//       await clearfyCategories(period, Period)
//     })

//     await Promise.all(deletedArtists)
//     await Promise.all(deletedGenres)
//     await Promise.all(deletedPeriods)

//     return syncSuccess
//   } catch (error) {
//     return error
//   }
// }

// const modifyAlbumsInDataBase = async (albums) => {
//   try {
//     const albumsUpdating = albums.map(async (el) => {
//       const original = await Album.findOne({ folderid: el.folderid }).exec()
//       await Album.replaceOne({ folderid: el.folderid }, { ...el, artist: original.artist, genre: original.genre })

//       return true
//     })

//     await Promise.all(albumsUpdating)

//     return syncSuccess
//   } catch (error) {
//     return error
//   }
// }
const getAlbumTitle = (name: string) => {
  const albumTitleRegExp = /\]([^)]+)\#/
  const albumTitle = albumTitleRegExp.exec(name)
  const albumTitleResult = albumTitle && albumTitle[1] ? albumTitle[1].trim() : 'unknown album'

  return albumTitleResult
}

const getArtistName = (name: string) => {
  const albumArtist = name.split('\[')[0]
  const artistNameResult = albumArtist ? albumArtist.trim() : 'unknown artist'

  return artistNameResult
}

const getAlbumGenres = (name: string) => {
  const albumGenres = name.split('#')[1]
  return albumGenres ? albumGenres.split(';') : ['unknown genre']
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
        artistName: getArtistName(el.name),
        genresArray: getAlbumGenres(el.name),
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

// const identifyChanges = async (dbAlbums, cloudAlbums) => {
//   dbAlbums.sort((a, b) => a.folderid - b.folderid)
//   cloudAlbums.sort((a, b) => a.folderid - b.folderid)

//   const modifiedAlbums = cloudAlbums.filter((el, index) => {
//     const cloudAlbumsModifiedDate = new Date(el.modified).getTime()
//     const dbAlbumsModifiedDate = new Date(dbAlbums[index].modified).getTime()

//     if (cloudAlbumsModifiedDate !== dbAlbumsModifiedDate) return el
//   })

//   if (modifiedAlbums.length) {
//     return await buildAlbumsData(modifiedAlbums, true)
//   }

//   return syncSuccess
// }

// const getNewAlbums = async (dbAlbums, cloudAlbums) => {
//   const newAlbums = cloudAlbums.filter((el) => {
//     if (dbAlbums.findIndex((album) => album.folderid === el.folderid) === -1) {
//       return el
//     }
//   })

//   if (newAlbums.length) {
//     return await buildAlbumsData(newAlbums)
//   }

//   return { ...unspecifiedError, data: { dbAlbums, cloudAlbums } }
// }

// const getDeletedData = async (dbAlbums, cloudAlbums) => {
//   const deletedAlbums = dbAlbums.filter((el) => {
//     if (cloudAlbums.findIndex((album) => album.folderid === el.folderid) === -1) {
//       return el
//     }
//   })

//   if (deletedAlbums.length) {
//     return await deleteDatabaseEntries(deletedAlbums)
//   }

//   return { ...unspecifiedError, data: { dbAlbums, cloudAlbums } }
// }

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

  console.log(albumsToAdd)
  console.log(albumsToDel)
  console.log(albumsToFix)

  // if (dbAlbums.length === cloudAlbums.length) {
  //   // return await identifyChanges(dbAlbums, cloudAlbums)
  // }

  // if (cloudAlbums.length > dbAlbums.length) {
  //   // return await getNewAlbums(dbAlbums, cloudAlbums)
  // }

  // // return await getDeletedData(dbAlbums, cloudAlbums)
  return 0
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

// const createNewCategory = async (Model, title) => {
//   try {
//     const payload = {
//       title: title,
//       albums: [],
//       framesAlbums: []
//     }
//     const newCategory = new Model(payload)
//     const savedCategory = await newCategory.save()
    
//     return savedCategory
//   } catch (error) {
//     return error
//   }
// }

// const create = async (req, res) => {
//   const modelsDict = {
//     artists: Artist,
//     genres: Genre,
//     periods: Period
//   }

//   try {
//     const response = await createNewCategory(modelsDict[req.body.category], req.body.value)

//     // switch (req.body.category) {
//     //   case 'artists':
//     //     response = await createNewCategory(Artist, req.body.value)
//     //     break
//     //   case 'genres':
//     //     response = await createNewCategory(Genre, req.body.value)
//     //     break
//     //   case 'periods':
//     //     response = await createNewCategory(Period, req.body.value)
//     //     break
//     // }

//     res.status(201).json(response)
//   } catch (error) {
//     res.status(500).json({ message: error.message })
//   }
// }

const controller = {
  synchronize
}

export default controller
