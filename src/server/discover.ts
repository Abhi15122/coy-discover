import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { Profile, SwipeAction, SwipeResult } from "../lib/types.ts";
import { incomingLikes, seedProfiles } from "./profiles.ts";

type ProfileRow = Omit<Profile, "interests"> & { interests: string };

function publicProfile(row: ProfileRow): Profile {
  return { ...row, interests: JSON.parse(row.interests) as string[] };
}

const profileColumns = "p.id, p.name, p.age, p.city, p.bio, p.interests, p.photo";

export function openDiscoverDatabase(path = process.env.DISCOVER_DB_PATH ?? ".data/discover.sqlite") {
  if (path !== ":memory:") mkdirSync(dirname(resolve(path)), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec("PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL;");
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      city TEXT NOT NULL,
      bio TEXT NOT NULL,
      interests TEXT NOT NULL,
      photo TEXT NOT NULL,
      liked_demo_user INTEGER NOT NULL CHECK (liked_demo_user IN (0, 1))
    );
    CREATE TABLE IF NOT EXISTS swipes (
      profile_id INTEGER PRIMARY KEY REFERENCES profiles(id),
      action TEXT NOT NULL CHECK (action IN ('like', 'pass')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  if (!db.prepare("SELECT 1 FROM profiles LIMIT 1").get()) {
    db.exec("BEGIN IMMEDIATE");
    try {
      const insert = db.prepare("INSERT OR IGNORE INTO profiles VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
      for (const profile of seedProfiles) {
        insert.run(profile.id, profile.name, profile.age, profile.city, profile.bio,
          JSON.stringify(profile.interests), profile.photo, Number(incomingLikes.includes(profile.id)));
      }
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      db.close();
      throw error;
    }
  }

  return {
    feed(): Profile[] {
      const rows = db.prepare(`
        SELECT ${profileColumns} FROM profiles p
        WHERE NOT EXISTS (SELECT 1 FROM swipes s WHERE s.profile_id = p.id)
        ORDER BY p.id
      `).all() as ProfileRow[];
      return rows.map(publicProfile);
    },
    matches(): Profile[] {
      // A match is derived from the persisted swipe and the seeded incoming like.
      const rows = db.prepare(`
        SELECT ${profileColumns} FROM swipes s JOIN profiles p ON p.id = s.profile_id
        WHERE s.action = 'like' AND p.liked_demo_user = 1
        ORDER BY s.created_at DESC, p.id
      `).all() as ProfileRow[];
      return rows.map(publicProfile);
    },
    swipe(profileId: number, action: SwipeAction): SwipeResult | "missing" | "conflict" {
      const profile = db.prepare(`SELECT ${profileColumns}, p.liked_demo_user FROM profiles p WHERE p.id = ?`)
        .get(profileId) as (ProfileRow & { liked_demo_user: number }) | undefined;
      if (!profile) return "missing";

      const inserted = db.prepare(`
        INSERT INTO swipes (profile_id, action) VALUES (?, ?)
        ON CONFLICT(profile_id) DO NOTHING
      `).run(profileId, action).changes > 0;
      const saved = db.prepare("SELECT action FROM swipes WHERE profile_id = ?").get(profileId);
      if (saved?.action !== action) return "conflict";

      const { liked_demo_user: incomingLike, ...fields } = profile;
      const match = action === "like" && incomingLike ? publicProfile(fields) : null;
      return { createdMatch: inserted && match !== null, match };
    },
    reset() {
      db.exec("DELETE FROM swipes");
    },
    close() {
      db.close();
    },
  };
}

let database: ReturnType<typeof openDiscoverDatabase> | undefined;

export function getDiscoverDatabase() {
  database ??= openDiscoverDatabase();
  return database;
}
