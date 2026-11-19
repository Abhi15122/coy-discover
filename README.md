# Sideby — Coy Discover assignment

Sideby is a standalone Discover prototype with a blank Home tab, 30 fictional profiles, and a single demo user. The design uses the screenshots’ pink, lavender, and mint palette as a reference, with Inter and original branding and layouts. All portraits are generated for the demo using a contact sheet of fictional Indian adults.

## Run locally

Requires Node.js 24 or later and npm. Run from the project root.

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). Like the first profile to see a mutual match, open Matches to find it again, then reload to verify swiped profiles stay out of the feed. Drag left or right on a touch screen or use Pass and Like.

SQLite seeds itself on the first request. The default database lives at `.data/discover.sqlite`. Set `DISCOVER_DB_PATH` to a different writable file for an independent demo. For a hosted instance, use a Node server with a persistent writable disk. Each installation shares one demo user and its swipe history.

```sh
npm run db:seed  # initialize profiles without clearing swipes
npm run db:reset # clear the demo swipes and matches
npm test
npm run typecheck
npm run build
```

## Structure

- `src/app` contains the App Router entry point, theme, and HTTP handlers.
- `src/components/discover` contains the app state, swipe card, navigation, and match views. Shared button styling lives in `src/components/ui`.
- `src/server` contains the SQLite queries and seed profiles. `src/lib/types.ts` describes the public profile and swipe response.

| Method | Path | Behavior |
| --- | --- | --- |
| GET | `/feed` | Returns `{ profiles }` with unswiped public profiles. |
| POST | `/swipe` | Accepts `{ profileId, action }`, where action is `like` or `pass`. Returns `{ createdMatch, match }`; match is a public profile or null. |
| GET | `/matches` | Returns `{ profiles }` with mutual matches only. |

A repeated identical swipe returns its saved outcome with `createdMatch: false`. A conflicting swipe returns HTTP 409. Matches are derived from the unique saved swipe and the seeded incoming like, so they persist without maintaining a second record. The feed and match responses expose public profile columns only.

[Part A — walkthrough and two feature suggestions](PART-A.md)
