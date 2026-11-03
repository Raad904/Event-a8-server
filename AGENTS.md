# server — Express backend

Part of a two-folder repo (`assignment8/` = `server/` + `events-platform-web/`). No root workspace config; the folders are coupled by import path and by the frontend calling this server on `http://localhost:5000`.

## Run it

- `node index.js` — ESM (`"type": "module"` in `package.json`). Listens on `PORT` or `5000`. Port `5000` is the contract the frontend hardcodes.
- No `dev`/`start`/`lint`/`build`/`test` scripts exist; `npm test` exits 1. There is no test directory, linter, or typecheck.
- Verification = start the server and hit the endpoints.

## Critical gotchas

- `index.js` is **self-contained**. It does **not** import `auth` from `events-platform-web/`, does not use `better-auth`, and has **no auth middleware** (`verifyUser` does not exist). Routes are open; the frontend attaches `createdBy`/`organizerEmail` itself and sends `credentials: "include"`.
- Do not move `index.js` without checking `src/app/api/auth/[...all]/route.js` in the frontend, which imports `auth` from `../../../../lib/auth.js` (a path relative to the frontend folder, not this one).
- `cors()` is called with no options — it allows **all** origins, not just `http://localhost:3000`.
- `connectToMongoDB()` runs at module load (top-level await, line 28). A bad `MONGODB_URL` or unreachable cluster fails immediately.

## Environment

- `.env` is required (`MONGODB_URL`), loaded via `import 'dotenv/config'`. It contains real MongoDB Atlas credentials — `.gitignore` excludes `.env` and `node_modules`; never commit `.env`.
- Mongo: db `Event`, collection `destination`; IDs are `ObjectId`.

## Routes

- `GET /` → "hellow"
- `POST /Create-event` → inserts `req.body` as-is into `destination`
- `GET /my-event` → public, all events in `destination`
- `GET /my-event/:id` → one event by `ObjectId`
- `PATCH /my-event/:id` → `updateOne` with `$set` of `req.body`; no field stripping
- `DELETE /my-event/:id` → deletes by `ObjectId`; 404 if not found

Note: `Upcoming-Events/page.jsx` (frontend) calls `GET /events`, but the server has **no `/events` route** — all events live at `GET /my-event`.

## Related instruction file

- `../events-platform-web/AGENTS.md` — Next.js/App Router conventions for the frontend that calls this server on `localhost:5000`.
