# Harn-Kan User Service

User and authentication service built with Express and MongoDB.

## Setup

```bash
cp .env.example .env
```

Set `JWT_SECRET` in `.env` (at least 32 characters).

## Run with Docker

Starts the API and MongoDB:

```bash
docker compose up -d --build
```

- API: http://localhost:3000
- Logs: `docker compose logs -f --no-log-prefix user-service | npx pino-pretty`
- Stop: `docker compose down` (add `-v` to also delete the database volume)

## Run locally

Start only MongoDB in Docker, then run the API with hot reload:

```bash
docker compose up -d mongodb
npm install
npm run dev
```

## Environment variables

| Variable              | Description                                                | Default       |
| --------------------- | ---------------------------------------------------------- | ------------- |
| `PORT`                | API port                                                   | `3000`        |
| `NODE_ENV`            | `development`, `test` or `production`                      | `development` |
| `MONGODB_URI`         | Mongo connection string (overridden in Docker)             | —             |
| `JWT_SECRET`          | Secret for signing tokens                                  | —             |
| `JWT_EXPIRES_IN`      | Token lifetime                                             | `1d`          |
| `LOG_LEVEL`           | Pino log level                                             | `info`        |
| `SHUTDOWN_TIMEOUT_MS` | Max time for graceful shutdown before forced exit          | `10000`       |
| `MONGO_*`             | MongoDB root and app user credentials (see `.env.example`) | —             |

## API

| Method | Path                        | Description                     |
| ------ | --------------------------- | ------------------------------- |
| POST   | `/api/v1/auth/register`     | Register a user                 |
| POST   | `/api/v1/auth/login`        | Log in, returns a JWT           |
| GET    | `/api/v1/users/me`          | Get current user                |
| PUT    | `/api/v1/users/me`          | Update current user             |
| PATCH  | `/api/v1/users/me/location` | Report the user's location      |
| DELETE | `/api/v1/users/me`          | Deactivate current user         |
| GET    | `/internal/users/nearby`    | Find active users near a point  |
| GET    | `/health/live`              | Liveness check                  |
| GET    | `/health/ready`             | Readiness (DB + shutdown state) |

`/users/me` routes require `Authorization: Bearer <token>`.

`/internal` routes have no authentication of their own. The gateway never routes them, so port 3000 must not be reachable from outside.

### Location

`PATCH /api/v1/users/me/location` takes `{ "latitude": 13.7563, "longitude": 100.5018 }`. The server sets `location_updated_at` from its own clock and leaves `updated_at` unchanged. The response `data` contains only `latitude` and `longitude`.

### Nearby users

`GET /internal/users/nearby` returns active users whose location was reported recently enough. Users who never reported one are not included.

| Query           | Required | Default | Notes                                    |
| --------------- | -------- | ------- | ---------------------------------------- |
| `lat`, `lng`    | yes      | —       | The centre point                         |
| `radiusMeters`  | no       | `500`   | Up to `50000`; a distance equal to it counts |
| `maxAgeMinutes` | no       | `1440`  | How old `location_updated_at` may be     |
| `limit`         | no       | `500`   | Page size, up to `1000`                  |
| `cursor`        | no       | —       | `nextCursor` from the previous page      |

```json
{
  "success": true,
  "data": { "userIds": ["user-101", "user-205"], "nextCursor": null }
}
```

## Scripts

| Command          | Description                      |
| ---------------- | -------------------------------- |
| `npm run dev`    | Start with nodemon + pino-pretty |
| `npm start`      | Start in production mode         |
| `npm test`       | Run tests                        |
| `npm run lint`   | Lint                             |
| `npm run format` | Format with Prettier             |
