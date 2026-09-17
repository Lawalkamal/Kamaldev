#!/usr/bin/env node
/**
 * One-time helper that turns your Spotify Client ID + Secret into the
 * SPOTIFY_REFRESH_TOKEN the app needs. Run it once; the token does not expire.
 *
 *   npm run spotify:auth
 *
 * It starts a tiny listener on a loopback address, sends you to Spotify to
 * approve, catches the redirect, swaps the code for a refresh token, and
 * writes the result into .env.local.
 *
 * Note on the redirect URI: Spotify rejects `localhost` outright and requires
 * an explicit loopback address, so this uses http://127.0.0.1:PORT/callback.
 * That exact string has to be registered on the app dashboard — see README.
 *
 * Flags:
 *   --port=8123        change the listener port (must match the dashboard)
 *   --redirect=<uri>   override the whole redirect URI
 *   --no-write         print the token instead of writing .env.local
 */

import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { exec } from "node:child_process";
import { randomUUID } from "node:crypto";
import path from "node:path";
import process from "node:process";

const ENV_PATH = path.join(process.cwd(), ".env.local");
// recently-played is the fallback face; currently-playing is what makes the
// card follow along as tracks change. A refresh token keeps whatever scopes it
// was minted with, so adding one here means re-running this script.
const SCOPES = ["user-read-currently-playing", "user-read-recently-played"];

const args = process.argv.slice(2);
const flag = (name) => args.some((a) => a === `--${name}`);
const value = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

const port = Number(value("port", "8123"));
const redirectUri = value("redirect", `http://127.0.0.1:${port}/callback`);
const writeEnv = !flag("no-write");

function parseEnv(raw) {
  const map = {};
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
    if (!match) continue;
    map[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return map;
}

function openBrowser(url) {
  const command =
    process.platform === "win32"
      ? `start "" "${url}"`
      : process.platform === "darwin"
        ? `open "${url}"`
        : `xdg-open "${url}"`;
  exec(command, () => {
    /* if it fails, the URL is printed anyway */
  });
}

async function main() {
  const raw = existsSync(ENV_PATH) ? await readFile(ENV_PATH, "utf8") : "";
  const env = parseEnv(raw);

  const clientId = process.env.SPOTIFY_CLIENT_ID || env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error(
      `
Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET.

  1. https://developer.spotify.com/dashboard -> Create app
  2. Add this Redirect URI exactly (localhost is rejected by Spotify):
       ${redirectUri}
  3. Add both values to .env.local, then run this again.
`
    );
    process.exitCode = 1;
    return;
  }

  const state = randomUUID();

  const authorizeUrl =
    "https://accounts.spotify.com/authorize?" +
    new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: redirectUri,
      scope: SCOPES.join(" "),
      state,
      show_dialog: "true",
    });

  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", redirectUri);
    if (url.pathname !== "/callback") {
      res.writeHead(404).end("Not the callback route.");
      return;
    }

    const fail = (message) => {
      res.writeHead(400, { "Content-Type": "text/html" });
      res.end(`<h1>Spotify setup failed</h1><p>${message}</p>`);
      console.error(`\n✖ ${message}\n`);
      server.close(() => process.exit(1));
    };

    if (url.searchParams.get("error")) {
      return fail(`Spotify said: ${url.searchParams.get("error")}`);
    }
    if (url.searchParams.get("state") !== state) {
      return fail("State mismatch — the redirect did not come from this run.");
    }

    const code = url.searchParams.get("code");
    if (!code) return fail("No authorization code in the redirect.");

    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    const data = await tokenRes.json().catch(() => ({}));
    if (!tokenRes.ok || !data.refresh_token) {
      return fail(
        `Token exchange failed (${tokenRes.status}): ${
          data.error_description || data.error || "unknown error"
        }`
      );
    }

    const line = `SPOTIFY_REFRESH_TOKEN=${data.refresh_token}`;
    if (writeEnv) {
      const next = /^SPOTIFY_REFRESH_TOKEN=/m.test(raw)
        ? raw.replace(/^SPOTIFY_REFRESH_TOKEN=.*$/m, line)
        : (raw === "" || raw.endsWith("\n") ? raw : raw + "\n") + line + "\n";
      await writeFile(ENV_PATH, next, "utf8");
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(
      `<h1>Done — you can close this tab.</h1><p>${
        writeEnv
          ? "The refresh token is now in .env.local."
          : "The refresh token is printed in your terminal."
      }</p>`
    );

    console.log(
      `
✓ Refresh token received${writeEnv ? " and written to .env.local" : ""}.

${writeEnv ? "" : `${line}\n`}
Scopes granted: ${data.scope || SCOPES.join(" ")}
Restart the dev server (or redeploy) and the Spotify face of the
"While You're Here" card will show your last played track.
`
    );

    server.close(() => process.exit(0));
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `\n✖ Port ${port} is already in use. Retry with:\n    npm run spotify:auth -- --port=${port + 1}\n   and register the matching redirect URI.\n`
      );
    } else {
      console.error("\n✖", error.message, "\n");
    }
    process.exit(1);
  });

  server.listen(port, "127.0.0.1", () => {
    console.log(
      `
Waiting for you to approve the app...

  Redirect URI in use:  ${redirectUri}
  (this exact string must be saved on the app dashboard)

If the browser does not open, paste this in:

${authorizeUrl}
`
    );
    openBrowser(authorizeUrl);
  });
}

main().catch((error) => {
  console.error("\n✖", error);
  process.exit(1);
});
