# API & Routing

## Route map

| Mount | File | Auth |
|-------|------|------|
| `/api/users` | `users.routes.ts` | Mixed (login public) |
| `/api/albums` | `albums.routes.ts` | `authChecker` |
| `/api/tracks` | `tracks.routes.ts` | `authChecker` |
| `/api/artists` | `artists.routes.ts` | `authChecker` |
| `/api/genres` | `genres.routes.ts` | `authChecker` |
| `/api/periods` | `periods.routes.ts` | `authChecker` |
| `/api/collections` | `collections.routes.ts` | `authChecker` |
| `/api/compilations` | `compilations.routes.ts` | `authChecker` |
| `/api/search` | `search.routes.ts` | `authChecker` |
| `/api/backup` | `backup.routes.ts` | `authChecker` |
| `/api/sync` | `sync.routes.ts` | `authChecker` |
| `/api/discogs` | `discogs.routes.ts` | **No auth** |
| `/api/proxy` | `stream.routes.ts` | **No auth** (audio stream) |

Static: `/backups`, `/uploads`, `/robots.txt`.

## Auth

- **Middleware:** `middleware/auth.checker.ts` — reads `accessToken` cookie, verifies JWT, sets `req.user`.
- **Tokens:** `TokenService` — access + refresh JWT; refresh stored in DB.
- **Login:** `POST /api/users/login` → httpOnly cookies.
- **403** if missing/invalid token on protected routes.

## List endpoints — query contract

Services use `Parser.parseNestedQuery<ListRequestConfig>(req)`.

### `ListRequestConfig` (`types/pagination.d.ts`)

```typescript
{
  limit: number
  page: number
  sort: Record<string, 1 | -1>   // e.g. sort[dateCreated]=-1
  isRandom?: true | 1
  filter?: RelatedAlbumsReqFilter  // related albums on entity pages
  noteFilter?: 'all' | 'withReviews' | 'withoutReviews'
  vinylFilter?: 'all' | 'onVinyl' | 'notOnVinyl'
}
```

Example:

```
GET /api/albums?page=2&limit=12&sort[dateCreated]=-1&noteFilter=withReviews&vinylFilter=onVinyl
```

### Album list — repository behaviour (`AlbumRepository`)

**Filters** (combinable via `$and`):

- `noteFilter`: `withReviews` → note length **>** 250; `withoutReviews` → **≤** 250.
- `vinylFilter`: `onVinyl` → `availableOnVinyl: true`; `notOnVinyl` → `$ne: true`.

**Sort** (single field):

- Allowed: `title`, `dateCreated`, `modified`, `period`.
- Default if invalid/missing: `{ dateCreated: -1 }`.
- **`period` sort** uses aggregation (`$lookup` periods + `$facet` pagination) — not plain `paginate`.

**Random albums:** `isRandom=1` + optional `filter` → `$sample` aggregation.

### Album-specific mutations

| Method | Path | Body |
|--------|------|------|
| PUT | `/api/albums/:id/note` | `{ note }` |
| PUT | `/api/albums/:id/vinyl` | `{ availableOnVinyl: boolean }` |

## Pagination response

```typescript
{ pagination: { totalDocs, totalPages, page }, docs: [...] }
```

Built via `PaginationViewFactory.create()`.

## Sync

`POST /api/sync` → compares cloud folders under `MelodyMap/Collection` with DB → create/remove/update albums.

Returns `{ added, invalid, updated, deleted }`.

## Backup

| Method | Path | Action |
|--------|------|--------|
| GET | `/api/backup` | List backup timestamps |
| POST | `/api/backup/save` | Export JSON to `backups/<timestamp>/` |
| POST | `/api/backup/restore/:date` | Restore (ordered: users → categories → albums → tracks → gatherings) |
| DELETE | `/api/backup/:date` | Delete backup folder |

## Uploads

- Webp only, max 5MB (`middleware/upload.ts`).
- Saved under project `uploads/`.
