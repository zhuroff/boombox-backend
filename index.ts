import 'module-alias/register'
import dotenv from 'dotenv'
import express, { json } from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import morgan from 'morgan'
import albumsRoutes from '~/routes/albums.routes'
// import artistsRoutes from './routes/artist.js'
// import genresRoutes from './routes/genres.js'
// import periodsRoutes from './routes/periods.js'
// import playlistsRoutes from './routes/playlists.js'
// import tracksRoutes from './routes/tracks.js'
// import searchRoutes from './routes/search.js'
// import framesRoutes from './routes/frames.js'
// import collectionsRoutes from './routes/collections.js'
// import stationsRoutes from './routes/stations.js'
// import synchronizeRoutes from './routes/synchronize.js'
import backupRoutes from './routes/backup.routes'

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
// app.use('/api/artists', artistsRoutes)
// app.use('/api/genres', genresRoutes)
// app.use('/api/periods', periodsRoutes)
// app.use('/api/playlists', playlistsRoutes)
// app.use('/api/tracks', tracksRoutes)
// app.use('/api/search', searchRoutes)
// app.use('/api/frames', framesRoutes)
// app.use('/api/collections', collectionsRoutes)
// app.use('/api/stations', stationsRoutes)
// app.use('/api/synchronize', synchronizeRoutes)
app.use('/api/backup', backupRoutes)

app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`))
