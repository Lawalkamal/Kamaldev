import { NextResponse } from "next/server";
import { createClient, type Client } from "@libsql/client";

/**
 * Visitor counter for the "Visitors" card.
 *
 * With TURSO_DATABASE_URL (+ TURSO_AUTH_TOKEN) set, the count lives in a
 * libsql/Turso database and survives deploys. Without it the count is kept in
 * memory for the lifetime of the server process — fine for local development,
 * but serverless instances are recycled, so configure Turso before shipping
 * this to production.
 *
 * `persisted` tells the client which of the two it is talking to, and the
 * server logs a single warning whenever it has to fall back, so a wrong url or
 * token cannot pass for a working database.
 *
 * A `file:` url also works for local experiments, e.g.
 * `TURSO_DATABASE_URL=file:.data/visitors.db` — the parent directory has to
 * exist first, because SQLite will not create it.
 */

const TABLE = "counters";
const KEY = "visitors";

export const dynamic = "force-dynamic";

let memoryCount = 0;
let db: Client | null = null;
let tableReady = false;
let warned = false;

/** One warning per process: a misconfigured database should be loud once, not
    on every request — and never silent, or the count just looks broken. */
function warnOnce(message: string, error: unknown) {
  if (warned) return;
  warned = true;
  console.warn(
    `[visitors] ${message}`,
    error instanceof Error ? error.message : error
  );
}

function getDb(): Client | null {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) return null;
  if (db) return db;

  try {
    db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  } catch (error) {
    // A malformed url, or a database this runtime cannot open, must degrade to
    // the in-memory counter. Returning null keeps the card on screen; letting
    // it throw would 500 the whole request.
    warnOnce("TURSO_DATABASE_URL could not be opened; counting in memory.", error);
    return null;
  }

  return db;
}

async function ensureTable(client: Client) {
  if (tableReady) return;
  await client.execute(
    `CREATE TABLE IF NOT EXISTS ${TABLE} (key TEXT PRIMARY KEY, value INTEGER NOT NULL)`
  );
  tableReady = true;
}

async function readCount(): Promise<{ count: number; persisted: boolean }> {
  const client = getDb();
  if (!client) return { count: memoryCount, persisted: false };

  try {
    await ensureTable(client);
    const result = await client.execute({
      sql: `SELECT value FROM ${TABLE} WHERE key = ?`,
      args: [KEY],
    });
    if (result.rows.length === 0) return { count: 0, persisted: true };
    return { count: Number(result.rows[0].value) || 0, persisted: true };
  } catch (error) {
    // Unreachable database: degrade to the in-memory number rather than
    // breaking the card.
    warnOnce("database read failed; counting in memory.", error);
    return { count: memoryCount, persisted: false };
  }
}

/**
 * Adds one to the count and returns the new value.
 *
 * The increment is a single statement on purpose. Reading the count and then
 * writing it back loses a visit whenever two people land at the same moment —
 * both read the same number and both write the same number plus one. A busy
 * portfolio is exactly the situation where that happens.
 */
async function increment(): Promise<{ count: number; persisted: boolean }> {
  const client = getDb();
  if (!client) {
    memoryCount += 1;
    return { count: memoryCount, persisted: false };
  }

  try {
    await ensureTable(client);
    const result = await client.execute({
      sql: `INSERT INTO ${TABLE} (key, value) VALUES (?, 1)
            ON CONFLICT(key) DO UPDATE SET value = ${TABLE}.value + 1
            RETURNING value`,
      args: [KEY],
    });

    const value = result.rows[0]?.value;
    if (value !== undefined && value !== null) {
      return { count: Number(value), persisted: true };
    }

    // RETURNING needs SQLite 3.35+; anything older falls back to the racy
    // path rather than failing the card.
    const { count } = await readCount();
    await client.execute({
      sql: `INSERT INTO ${TABLE} (key, value) VALUES (?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      args: [KEY, count + 1],
    });
    return { count: count + 1, persisted: true };
  } catch (error) {
    warnOnce("database write failed; counting in memory.", error);
    memoryCount += 1;
    return { count: memoryCount, persisted: false };
  }
}

export async function GET() {
  const { count, persisted } = await readCount();
  return NextResponse.json(
    { count, persisted },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST() {
  const result = await increment();
  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  });
}
