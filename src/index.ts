import dotenv from 'dotenv'
import path from 'node:path'
import express, { json } from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import morgan from 'morgan'
import usersRoutes from './routes/users.routes'
import albumsRoutes from './routes/albums.routes'
import toyRoutes from './routes/toy.routes'
import discogsRoutes from './routes/discogs.routes'
import tracksRoutes from './routes/tracks.routes'
import artistsRoutes from './routes/artists.routes'
import genresRoutes from './routes/genres.routes'
import periodsRoutes from './routes/periods.routes'
import embeddedRoutes from './routes/embedded.routes'
import playlistsRoutes from './routes/playlists.routes'
import searchRoutes from './routes/search.routes'
import collectionsRoutes from './routes/collections.routes'
import radioRoutes from './routes/radio.routes'
import backupRoutes from './routes/backup.routes'
import synchronizeRoutes from './routes/sync.routes'
import cloudRoutes from './routes/cloud.routes'
import { CloudApi, CloudKeys } from './types/Cloud'
import { PCloudApi } from './clouds/cloud.pcloud'
import { YandexCloudApi } from './clouds/cloud.yandex'

dotenv.config()

const app = express()
const PORT = 3001
export const rootDir = path.resolve(__dirname, '../')
export const cloudRootPath = `${process.env['COLLECTION_ROOT']}/Collection`

export const cloudsMap = new Map<CloudKeys, CloudApi>([
  ['https://eapi.pcloud.com', new PCloudApi(cloudRootPath)],
  ['https://cloud-api.yandex.net', new YandexCloudApi(cloudRootPath)]
])

export const getCloudApi = (url: CloudKeys) => cloudsMap.get(url) as CloudApi

mongoose.connect(process.env['MONGO_URI'] as string)
  .then(() => console.log('MongoDB connected'))
  .catch((error) => console.log(error))

app.use(cors())
app.use(morgan('tiny'))
app.use(express.urlencoded({ extended: true }))
app.use(json())
app.use('/api/users', usersRoutes)
app.use('/api/albums', albumsRoutes)
app.use('/api/toy', toyRoutes)
app.use('/api/discogs', discogsRoutes)
app.use('/api/tracks', tracksRoutes)
app.use('/api/artists', artistsRoutes)
app.use('/api/genres', genresRoutes)
app.use('/api/periods', periodsRoutes)
app.use('/api/embedded', embeddedRoutes)
app.use('/api/playlists', playlistsRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/collections', collectionsRoutes)
app.use('/api/radio', radioRoutes)
app.use('/api/backup', backupRoutes)
app.use('/api/sync', synchronizeRoutes)
app.use('/api/cloud', cloudRoutes)
app.use('/backups', express.static(rootDir + '/backups'))
app.use('/uploads', express.static(rootDir + '/uploads'))

app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`))
