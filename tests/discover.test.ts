import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { test, type TestContext } from "node:test";
import { openDiscoverDatabase } from "../src/backend/discover.ts";

function createFixture(t: TestContext) {
  const directory = mkdtempSync(join(tmpdir(), "sideby-test-"));
  const path = join(directory, "discover.sqlite");
  t.after(() => rmSync(directory, { recursive: true, force: true }));

  openDiscoverDatabase(path).close();
  using fixture = new DatabaseSync(path);
  fixture.exec("UPDATE profiles SET liked_demo_user = CASE WHEN id = 1 THEN 1 ELSE 0 END");
  return path;
}

test("feed is public and a one-sided like does not create a match", (t) => {
  const db = openDiscoverDatabase(createFixture(t));
  try {

    const feed = db.feed();
    assert.equal(feed.length, 30);
    for (const profile of feed) {
      assert.deepEqual(Object.keys(profile).sort(), ["age", "bio", "city", "id", "interests", "name", "photo"]);
    }
    assert.deepEqual(db.matches(), []);
    assert.deepEqual(db.swipe(2, "like"), { createdMatch: false, match: null });
    assert.ok(!db.feed().some(({ id }) => id === 2));
    assert.deepEqual(db.matches(), []);
  } finally {
    db.close();
  }
});

test("passing on an incoming like reveals nothing", (t) => {
  const db = openDiscoverDatabase(createFixture(t));
  try {
    assert.deepEqual(db.swipe(1, "pass"), { createdMatch: false, match: null });
    assert.deepEqual(db.swipe(2, "pass"), { createdMatch: false, match: null });
    assert.equal(db.swipe(1, "like"), "conflict");
    assert.ok(!db.feed().some(({ id }) => id === 1));
    assert.deepEqual(db.matches(), []);
  } finally {
    db.close();
  }
});

test("a mutual match survives a restart, and a replay returns the same match without creating another", (t) => {
  const path = createFixture(t);

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

test("a fresh demo has at least one mutual match among the first three likes", (t) => {
  const db = openDiscoverDatabase(":memory:");
  t.after(() => db.close());
  for (const { id } of db.feed().slice(0, 3)) db.swipe(id, "like");
  assert.ok(db.matches().length > 0);
});

test("exhausting the feed returns an empty array", (t) => {
  const db = openDiscoverDatabase(":memory:");
  t.after(() => db.close());
  for (const { id } of db.feed()) db.swipe(id, "pass");
  assert.deepEqual(db.feed(), []);
  assert.equal(db.swipe(999, "like"), "missing");
});
