# server — Express backend

Part of a two-folder repo (`assignment8/` = `server/` + `events-platform-web/`). No root workspace config; the folders are coupled by import path.

## Run it

- `node index.js` — ESM (`"type": "module"` in `package.json`). Listens on `PORT` or `5000`.
- No `dev`/`start`/`lint`/`build`/`test` scripts exist; `npm test` exits 1. There is no test directory, linter, or typecheck.
- Verification = start the server and hit the endpoints (port `5000` is the contract the frontend hardcodes).

## Critical gotcha — do not move files blindly

`index.js` imports `auth` from `../events-platform-web/src/lib/auth.js` (a relative path into the sibling folder). The server will not start without `events-platform-web/` present at that exact location, and it shares that folder's better-auth instance (db `Event`). If you relocate `index.js` or the auth import, update both sides.

## Environment

- `.env` is required (`MONGODB_URL`), loaded via `import 'dotenv/config'`. It contains real MongoDB Atlas credentials — `.gitignore` excludes `.env` and `node_modules`; never commit `.env`.
- `connectToMongoDB()` runs at module load (top-level await); a bad `MONGODB_URL` or unreachable cluster fails immediately.

## Routes & auth

- `GET /` → "hellow"
- `GET /events` → public, all events
- `POST /Create-event`, `GET /my-event`, `GET /my-event/:id`, `PATCH /my-event/:id`, `DELETE /my-event/:id` → require `verifyUser` middleware (`better-auth/node` session via `fromNodeHeaders`; 401 when no session). Writes set `createdBy`/`organizerEmail` from `req.user`; `PATCH` strips `createdBy` and `_id` from the body.
- Mongo: db `Event`, collection `destination`; IDs are `ObjectId`.
- CORS allows only `http://localhost:3000` with credentials — matches the frontend origin.

## Related instruction file

- `../events-platform-web/AGENTS.md` — Next.js/app-router conventions for the frontend that calls this server on `localhost:5000`.
