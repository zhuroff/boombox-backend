# Domain Models & Integrations

## Core entities (MongoDB)

### Album (`models/album.model.ts`)

| Field | Notes |
|-------|--------|
| `title`, `folderName`, `path`, `cloudURL` | From cloud folder sync |
| `artists[]`, `genre`, `period` | ObjectId refs |
| `tracks[]` | Track refs |
| `inCollections[]` | Collection refs |
| `note` | Rich text review |
| `availableOnVinyl` | Boolean, default false |
| `dateCreated` | Auto `Date.now` on insert |
| `modified` | Updated on sync/cloud changes |

**Removed:** `created` — use `dateCreated` only.

### Track (`models/track.model.ts`)

| Field | Notes |
|-------|--------|
| `title`, `fileName`, `path`, `cloudURL`, `mimeType` | |
| `inAlbum`, `artist`, `genre`, `period` | Refs |
| `inCompilations[]` | |
| `lyrics`, `duration`, `release` | Optional |
| `dateCreated` | Set from cloud file `created` on sync |
| `modified` | From cloud file `modified` |

**Removed:** `created` — cloud date mapped to `dateCreated` in `TrackRepository.createTrack`.

### Category models (Artist, Genre, Period)

Shared shape: `title` (unique), `poster`, `avatar`, `albums[]`, `dateCreated`.

### Collection / Compilation

- **Collection:** ordered albums `{ album, order, post }`.
- **Compilation:** ordered tracks `{ track, order }`.

### User / Token

- User: `login`, `email`, `password` (bcrypt), `role` (`admin` | `user` | `listener`).
- Token: refresh token storage.

## Cloud sync

**Root path:** `MelodyMap/Collection` (hardcoded in sync/album services).

**Providers** (`clouds/`):

| Provider | Env | Map key |
|----------|-----|---------|
| pCloud | `PCLOUD_*` | `https://eapi.pcloud.com` |
| Yandex | `YCLOUD_*` | `https://cloud-api.yandex.net` |

`getCloudApi(cloudURL)` resolves adapter by origin.

**Album folder name pattern** (validated in sync):

```
Artist [Year] Album Title #Genre
```

**Covers:** fetched from `{albumPath}/cover.webp` via cloud API.

**Track creation:** `createTrack` maps cloud entity dates → `dateCreated` / `modified`; does not spread entire cloud object into Mongoose doc.

## External APIs

### Discogs (`DiscogsRepository`)

- Collection + search endpoints under `/api/discogs` (no auth).
- Env: `DISCOGS_DOMAIN`, `DISCOGS_ACCESS_TOKEN`.

### Genius (`TrackRepository`)

- `GET /api/tracks/lyrics/search` — external lyrics search.
- Env: `GENIUS_SECRET`.

### Audio proxy

- `GET /api/proxy?url=...` — streams remote audio with Range support.

## AlbumService.createAlbum flow

1. Parse cloud folder shape → categories (artists, genre, period).
2. Create tracks via `TrackService.createTrack`.
3. `AlbumRepository.saveNewAlbum` — sets relations + `modified`; `dateCreated` from schema default.

## Date fields convention

| Model | Creation timestamp | Last change |
|-------|-------------------|-------------|
| Album | `dateCreated` (schema default) | `modified` (explicit) |
| Track | `dateCreated` (from cloud on sync) | `modified` (from cloud / updates) |

Do not reintroduce a separate `created` field on album/track documents.
