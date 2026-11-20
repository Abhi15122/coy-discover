# Coy Discover assignment

This standalone Discover prototype has a blank Home tab, 30 fictional profiles, and a single demo user. The design uses the screenshots’ pink, lavender, and mint palette as a reference, with Inter and an original layout. All portraits are generated for the demo using a contact sheet of fictional Indian adults.

## Run locally

Requires Node.js 24 or later and npm. Run from the project root.

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Drag right to like or left to pass. You can also click Pass or Like below the card. On a fresh database, liking the first few profiles exercises the match celebration. Open Matches to find mutual matches again, then reload to verify swiped profiles stay out of the feed.

If PowerShell blocks `npm.ps1`, use `npm.cmd ci` and `npm.cmd run dev`.

SQLite seeds itself on the first request. The default database lives at `.data/discover.sqlite`. Set `DISCOVER_DB_PATH` to a different writable file for an independent demo. For a hosted instance, use a Node server with a persistent writable disk. Each installation shares one demo user and its swipe history.

```sh
npm run db:seed  # initialize profiles without clearing swipes
npm run db:reset # clear the demo swipes and matches
npm test
npm run typecheck
npm run build
```

## Structure

- `src/frontend` contains React components, client state, the Tailwind theme, and animations. Discover-specific components live under `components/discover`, with shared controls under `components/ui`.
- `src/backend` contains the SQLite queries, swipe and match logic, and seed profiles.
- `src/shared` contains the public TypeScript types used on both sides.
- `src/app` connects the frontend to Next.js. The HTTP route handlers in `src/app/(api)` call the backend. One Next.js process serves both.

| Method | Path | Behavior |
| --- | --- | --- |
| GET | `/feed` | Returns `{ profiles }` with unswiped public profiles. |
| POST | `/swipe` | Accepts `{ profileId, action }`, where action is `like` or `pass`. Returns `{ createdMatch, match }`; match is a public profile or null. |
| GET | `/matches` | Returns `{ profiles }` with mutual matches only. |

A repeated identical swipe returns its saved outcome with `createdMatch: false`. A conflicting swipe returns HTTP 409. Matches are derived from the unique saved swipe and the incoming like, so they persist without maintaining a second record. Incoming likes are chosen when a fresh database is seeded and kept in SQLite. The feed exposes public profile fields only, and passing never discloses an incoming like.

[Part A — walkthrough and two feature suggestions](PART-A.md)
