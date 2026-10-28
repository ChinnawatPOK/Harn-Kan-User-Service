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

## Load test

The load test logs in with a pool of test accounts (`0890000000` to
`0890000199`, password `LoadTest1234`). Start the API and MongoDB, then run
(macOS, Linux or Git Bash):

```bash
tests/run-loadtest.sh               # journey: ramp up to 200 users
tests/run-loadtest.sh journey 50    # journey: ramp up to 50 users
tests/run-loadtest.sh login         # login: 20 logins per second for 1 minute
tests/run-loadtest.sh login 50      # login: 50 logins per second for 1 minute
```

The script first registers any pool accounts that do not exist yet
(`tests/seed-loadtest-users.sh`), so the first run creates them and later runs
reuse them. The test itself never creates or deletes users.

There are two scenarios:

- **journey**: users ramp up over 30 seconds, hold for one minute, and ramp
  down. Each virtual user logs in once with its own pool account, then keeps
  calling the current-user endpoint, like a real client.
- **login**: a fixed rate of logins per second for one minute, to measure how
  much login traffic the API can take. Login is CPU-heavy (bcrypt), so it is
  tested on its own.

k6 reports `login` and `get_current_user` separately, each with its own
thresholds (p95 under 2 seconds, under 1% failed requests). The default API URL
is `http://localhost:3000/api/v1`; override it with `BASE_URL=<url>`. Each run
saves the full k6 summary to `tests/loadtest-results.json`, replacing the
previous run's result.

To run k6 directly (for example from PowerShell), seed the pool first, then:

```powershell
k6 run -e SCENARIO=journey -e VUS=200 tests/loadtest.js
k6 run -e SCENARIO=login -e LOGIN_RATE=20 tests/loadtest.js
```
