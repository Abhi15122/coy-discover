import { openDiscoverDatabase } from "../src/backend/discover.ts";

const command = process.argv[2];
if (command !== "seed" && command !== "reset") {
  console.error("Use npm run db:seed or npm run db:reset.");
  process.exit(1);
}

const database = openDiscoverDatabase();
if (command === "reset") database.reset();
database.close();
console.log(command === "reset" ? "Demo swipes cleared." : "Demo profiles ready.");
