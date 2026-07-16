# Architecture

## Layered flow

```
HTTP → routes/*.routes.ts → controllers/*Controller.ts → services/*Service.ts
     → repositories/*Repository.ts → models/*.model.ts
                              ↘ clouds / Discogs / Genius (in repos)
```

**ViewFactories** (`src/views/`) transform documents into JSON-friendly API objects before `res.json()`.

## Entry point

`src/index.ts`:

- Connects MongoDB, configures CORS (credentials), cookies, JSON body.
- Mounts all `/api/*` routers.
- Exports `rootDir`, `cloudsMap`, `getCloudApi()` for use in repositories.
- Serves static `/uploads` (auth required). Backups are API-only (`/api/backup`).
- Port **3001**, binds to **127.0.0.1** in production (nginx reverse proxy).

## Folder structure (`src/`)

| Folder | Role |
|--------|------|
| `routes/` | Wire dependencies manually; mount middleware + controller methods |
| `controllers/` | HTTP layer; no business logic |
| `services/` | Business rules, orchestration, call ViewFactories |
| `repositories/` | Mongoose queries, aggregations, external HTTP |
| `models/` | Mongoose schemas |
| `views/` | Response DTO builders (`AlbumViewFactory`, `TrackViewFactory`, …) |
| `types/` | `*.d.ts` — repository interfaces, DTOs, `ListRequestConfig` |
| `middleware/` | `auth.checker`, validators, multer upload, noindex |
| `clouds/` | pCloud + Yandex Disk adapters |
| `utils/` | `Parser`, `Validator`, `http.ts` (fetch client) |
| `maps/` | Search model mapping |

## Dependency injection

No IoC container. Each `*.routes.ts` instantiates repos → services → controller inline:

```typescript
const albumRepository = new AlbumRepositoryContract()
const albumService = new AlbumService(albumRepository, /* … */)
const albumController = new AlbumsController(albumService)
router.get('/', authChecker, albumController.getAlbums)
```

Shared app singletons come from `src/index.ts` (`getCloudApi`, `rootDir`).

## Category abstraction

**Artist**, **Genre**, **Period** share:

- `CategoryController` + `CategoryService` + `CategoryRepository`
- Route passes Mongoose model: `artistController.getCategories(Artist)`

## Parser (`utils/Parser.ts`)

- `parseNestedQuery<T>(req)` — flattens query string with dot notation; coerces numbers/booleans.
- Album folder naming: `parseAlbumTitle`, `getArtistsString`, `parseTrackTitle`, etc.
- Used in list endpoints across services.

## ViewFactories (`views/`)

| Factory | Purpose |
|---------|---------|
| `AlbumViewFactory` | List item + full album page (tracks, note, `availableOnVinyl`) |
| `TrackViewFactory` | Track list/detail |
| `CategoryViewFactory` | Artist/genre/period pages |
| `GatheringViewFactory` | Collections & compilations |
| `PaginationViewFactory` | Normalizes paginate + Discogs pagination |
| `CloudEntityViewFactory` | Normalizes pCloud/Yandex file/folder entities |
| `BasicEntityView` | `{ _id, title, cloudURL? }` |

## Types (`types/*.d.ts`)

Repository **interfaces** live here; implementations are `*RepositoryContract` classes. Key files: `album.d.ts`, `track.d.ts`, `pagination.d.ts`, `cloud.d.ts`, `gathering.d.ts`.

## Error handling

Controllers typically: `try/catch`, `console.error`, `res.status(500).json(error)`. Domain validation errors may return structured objects (sync).

## Adding a new endpoint (checklist)

1. Extend repository interface in `types/`.
2. Implement in `*RepositoryContract`.
3. Add service method + ViewFactory mapping if needed.
4. Add controller handler.
5. Register route with `authChecker` unless public.
6. Mirror types/query params on frontend `RequestConfig` if list-related.
