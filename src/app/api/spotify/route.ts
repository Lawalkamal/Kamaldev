import { NextResponse } from "next/server";

/**
 * Latest track from Spotify's "recently played", for the flip card.
 *
 * SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET / SPOTIFY_REFRESH_TOKEN
 *
 * Get the refresh token once from the Authorization Code flow (scope
 * `user-read-recently-played`); it does not expire, and this route swaps it
 * for a short-lived access token on demand.
 *
 * Without the three variables the route answers `{ error }` and the card
 * shows its "Nothing playing recently" state.
 */

const CACHE_MS = 60_000;

/**
 * Access tokens live an hour, so they are kept until just before they expire
 * instead of being re-minted on every cache miss — token requests are rate
 * limited too.
 */
const TOKEN_SKEW_MS = 60_000;

let accessToken: { value: string; expiresAt: number } | null = null;

export type SpotifyTrack = {
  albumArt: string | null;
  album: string;
  name: string;
  artist: string;
  playedAt: string;
  url: string;
};

let cache: { data: SpotifyTrack; at: number } | null = null;

export const dynamic = "force-dynamic";

async function getAccessToken(): Promise<string | null> {
  if (accessToken && Date.now() < accessToken.expiresAt - TOKEN_SKEW_MS) {
    return accessToken.value;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // The usual cause is a refresh token minted against a different Client ID
    // (or an app whose secret was reset) — both are fixed by re-running
    // `npm run spotify:auth`.
    console.warn(
      `[spotify] token refresh failed (${res.status}${
        body?.error ? `: ${body.error}` : ""
      }) — re-run \`npm run spotify:auth\` if this persists.`
    );
    accessToken = null;
    return null;
  }

  const data = await res.json();
  if (!data?.access_token) return null;

  accessToken = {
    value: data.access_token,
    expiresAt: Date.now() + (Number(data.expires_in) || 3600) * 1000,
  };
  return accessToken.value;
}

export async function GET() {
  if (cache && Date.now() - cache.at < CACHE_MS) {
    return NextResponse.json(cache.data);
  }

  let token: string | null = null;
  try {
    token = await getAccessToken();
  } catch {
    token = null;
  }

  if (!token) {
    return NextResponse.json({ error: "Spotify not configured" });
  }

  try {
    const res = await fetch(
      "https://api.spotify.com/v1/me/player/recently-played?limit=1",
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
    );
    if (!res.ok) {
      return NextResponse.json({ error: "Spotify API error" });
    }

    const data = await res.json();
    const item = data?.items?.[0];
    if (!item?.track) {
      return NextResponse.json({ error: "Nothing playing recently" });
    }

    const track = item.track;
    const result: SpotifyTrack = {
      albumArt: track.album?.images?.[0]?.url ?? null,
      album: track.album?.name ?? "",
      name: track.name ?? "",
      artist:
        track.artists?.map((a: { name: string }) => a.name).join(", ") ?? "",
      playedAt: item.played_at ?? new Date().toISOString(),
      url: track.external_urls?.spotify ?? "https://open.spotify.com",
    };

    cache = { data: result, at: Date.now() };
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Spotify unavailable" });
  }
}
