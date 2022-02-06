import 'module-alias/register'
import dotenv from 'dotenv'
import express, { json } from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import morgan from 'morgan'
import albumsRoutes from '~/routes/albums.routes'
import tracksRoutes from '~/routes/tracks.routes'
import artistsRoutes from '~/routes/artists.routes'
import genresRoutes from '~/routes/genres.routes'
import periodsRoutes from '~/routes/periods.routes'
import framesRoutes from '~/routes/frames.routes'
import playlistsRoutes from '~/routes/playlists.routes'
// import tracksRoutes from './routes/tracks.js'
import searchRoutes from '~/routes/search.routes'
import collectionsRoutes from '~/routes/collections.routes'
// import stationsRoutes from './routes/stations.js'
import backupRoutes from './routes/backup.routes'
import synchronizeRoutes from './routes/synchronize.routes'

dotenv.config()

const app = express()
const PORT = 3000

mongoose.connect(process.env['MONGO_URI'] as string)
.then(() => console.log('MongoDB connected'))
.catch((error) => console.log(error))

app.use(cors())
app.use(morgan('tiny'))
app.use(express.urlencoded({ extended: true }))
app.use(json())

app.use('/api/albums', albumsRoutes)
app.use('/api/tracks', tracksRoutes)
app.use('/api/artists', artistsRoutes)
app.use('/api/genres', genresRoutes)
app.use('/api/periods', periodsRoutes)
app.use('/api/frames', framesRoutes)
app.use('/api/playlists', playlistsRoutes)
// app.use('/api/tracks', tracksRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/collections', collectionsRoutes)
// app.use('/api/stations', stationsRoutes)
// app.use('/api/synchronize', synchronizeRoutes)
app.use('/api/backup', backupRoutes)
app.use('/api/sync', synchronizeRoutes)

app.use('/uploads', express.static(__dirname + '/uploads'))

app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`))
