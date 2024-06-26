import dotenv from 'dotenv'
import path from 'node:path'
import express, { json } from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import usersRoutes from './routes/users.routes'
import albumsRoutes from './routes/albums.routes'
import discogsRoutes from './routes/discogs.routes'
import tracksRoutes from './routes/tracks.routes'
import artistsRoutes from './routes/artists.routes'
import genresRoutes from './routes/genres.routes'
import periodsRoutes from './routes/periods.routes'
import embeddedRoutes from './routes/embedded.routes'
import compilationsRoutes from './routes/compilations.routes'
import searchRoutes from './routes/search.routes'
import collectionsRoutes from './routes/collections.routes'
import backupRoutes from './routes/backup.routes'
import synchronizeRoutes from './routes/sync.routes'
import cloudRoutes from './routes/cloud.routes'
import { CloudApi } from './types/cloud.types'
import { PCloudApi } from './clouds/cloud.pcloud'
import { YandexCloudApi } from './clouds/cloud.yandex'
// import { cleanEverything } from './utils/clean'

dotenv.config()

const app = express()
const PORT = 3001
const corsConfig = {
  credentials: true,
  origin: process.env['NODE_ENV'] === 'development'
    ? process.env['CLIENT_URL_DEV']
    : process.env['CLIENT_URL_PROD']
}
export const rootDir = path.resolve(__dirname, '../')
export const cloudRootPath = `${process.env['COLLECTION_ROOT']}`

export const cloudsMap = new Map<string, CloudApi>([
  ['https://eapi.pcloud.com', new PCloudApi(cloudRootPath)],
  ['https://cloud-api.yandex.net', new YandexCloudApi(cloudRootPath)]
])

export const getCloudApi = (url: string) => cloudsMap.get(url) as CloudApi

mongoose.connect(process.env['MONGO_URI'] as string)
  .then(() => {
    console.log('MongoDB connected')
    // cleanEverything().then(() => console.log('Everything cleaned'))
  })
  .catch((error) => console.log(error))

app.use(cors(corsConfig))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(json({ limit: '1000kb' }))
app.use(morgan('tiny'))

app.use('/api/users', usersRoutes)
app.use('/api/albums', albumsRoutes)
app.use('/api/discogs', discogsRoutes)
app.use('/api/tracks', tracksRoutes)
app.use('/api/artists', artistsRoutes)
app.use('/api/genres', genresRoutes)
app.use('/api/periods', periodsRoutes)
app.use('/api/embedded', embeddedRoutes)
app.use('/api/compilations', compilationsRoutes)
app.use('/api/collections', collectionsRoutes)
app.use('/api/backup', backupRoutes)
app.use('/api/sync', synchronizeRoutes)
app.use('/api/cloud', cloudRoutes)
app.use('/api/search', searchRoutes)
app.use('/backups', express.static(rootDir + '/backups'))
app.use('/uploads', express.static(rootDir + '/uploads'))

app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`))
