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
 * `persisted` tells the client which of the two it is talking to.
 */

const TABLE = "counters";
const KEY = "visitors";

export const dynamic = "force-dynamic";

let memoryCount = 0;
let db: Client | null = null;
let tableReady = false;

function getDb(): Client | null {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) return null;
  if (!db) {
    db = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
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
  } catch {
    // Unreachable database: degrade to the in-memory number rather than
    // breaking the card.
    return { count: memoryCount, persisted: false };
  }
}

async function writeCount(value: number): Promise<void> {
  const client = getDb();
  if (!client) {
    memoryCount = value;
    return;
  }

  try {
    await ensureTable(client);
    await client.execute({
      sql: `INSERT INTO ${TABLE} (key, value) VALUES (?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      args: [KEY, value],
    });
  } catch {
    memoryCount = value;
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
  const { count, persisted } = await readCount();
  await writeCount(count + 1);
  const after = await readCount();

  return NextResponse.json(
    { count: after.count, persisted },
    { headers: { "Cache-Control": "no-store" } }
  );
}
