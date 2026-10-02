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

| Method | Path                    | Description                     |
| ------ | ----------------------- | ------------------------------- |
| POST   | `/api/v1/auth/register` | Register a user                 |
| POST   | `/api/v1/auth/login`    | Log in, returns a JWT           |
| GET    | `/api/v1/users/me`      | Get current user                |
| PUT    | `/api/v1/users/me`      | Update current user             |
| DELETE | `/api/v1/users/me`      | Deactivate current user         |
| GET    | `/health/live`          | Liveness check                  |
| GET    | `/health/ready`         | Readiness (DB + shutdown state) |

`/users/me` routes require `Authorization: Bearer <token>`.

## Scripts

| Command          | Description                      |
| ---------------- | -------------------------------- |
| `npm run dev`    | Start with nodemon + pino-pretty |
| `npm start`      | Start in production mode         |
| `npm test`       | Run tests                        |
| `npm run lint`   | Lint                             |
| `npm run format` | Format with Prettier             |
