import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { openDiscoverDatabase } from "../src/server/discover.ts";

test("feed is public and a one-sided like does not create a match", (t) => {
  const db = openDiscoverDatabase(":memory:");
  t.after(() => db.close());

  const feed = db.feed();
  assert.equal(feed.length, 30);
  assert.deepEqual(Object.keys(feed[0]).sort(), ["age", "bio", "city", "id", "interests", "name", "photo"]);
  assert.deepEqual(db.matches(), []);
  assert.deepEqual(db.swipe(2, "like"), { createdMatch: false, match: null });
  assert.ok(!db.feed().some(({ id }) => id === 2));
  assert.deepEqual(db.matches(), []);
});

test("passing on an incoming like reveals nothing", (t) => {
  const db = openDiscoverDatabase(":memory:");
  t.after(() => db.close());

  assert.deepEqual(db.swipe(1, "pass"), { createdMatch: false, match: null });
  assert.equal(db.swipe(1, "like"), "conflict");
  assert.ok(!db.feed().some(({ id }) => id === 1));
  assert.deepEqual(db.matches(), []);
});

test("a mutual match survives a restart, and a replay returns the same match without creating another", (t) => {
  const directory = mkdtempSync(join(tmpdir(), "sideby-test-"));
  const path = join(directory, "discover.sqlite");
  t.after(() => rmSync(directory, { recursive: true, force: true }));

  const first = openDiscoverDatabase(path);
  const profile = first.feed()[0];
  try {
    assert.deepEqual(first.swipe(profile.id, "like"), { createdMatch: true, match: profile });
  } finally {
    first.close();
  }

  const reopened = openDiscoverDatabase(path);
  // Close before deleting on Windows.
  try {
    assert.deepEqual(reopened.swipe(profile.id, "like"), { createdMatch: false, match: profile });
    assert.deepEqual(reopened.matches(), [profile]);
    assert.ok(!reopened.feed().some(({ id }) => id === profile.id));
  } finally {
    reopened.close();
  }
});

test("exhausting the feed returns an empty array", (t) => {
  const db = openDiscoverDatabase(":memory:");
  t.after(() => db.close());
  for (const { id } of db.feed()) db.swipe(id, "pass");
  assert.deepEqual(db.feed(), []);
  assert.equal(db.swipe(999, "like"), "missing");
});
