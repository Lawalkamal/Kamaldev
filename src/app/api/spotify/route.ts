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

/**
 * Cached per server instance to stay well clear of Spotify's rate limits.
 * A live track is re-checked sooner than a finished one, because that is the
 * thing a visitor is looking at the card to see.
 */
const PLAYING_CACHE_MS = 10_000;
const IDLE_CACHE_MS = 45_000;

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
  /** True when this is the track playing right now, false when it has ended. */
  playing: boolean;
};

let cache: { data: SpotifyTrack; at: number; ttl: number } | null = null;

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

type SpotifyArtist = { name: string };
type SpotifyItem = {
  name?: string;
  artists?: SpotifyArtist[];
  album?: { name?: string; images?: { url?: string }[] };
  external_urls?: { spotify?: string };
};

function toTrack(
  item: SpotifyItem | undefined,
  playedAt: string,
  playing: boolean
): SpotifyTrack | null {
  if (!item?.name) return null;
  return {
    albumArt: item.album?.images?.[0]?.url ?? null,
    album: item.album?.name ?? "",
    name: item.name,
    artist: (item.artists ?? []).map((a) => a.name).join(", "),
    playedAt,
    url: item.external_urls?.spotify ?? "https://open.spotify.com",
    playing,
  };
}

/**
 * What is playing this second. Needs the `user-read-currently-playing` scope:
 * without it Spotify answers 403, which is treated as "nothing playing" so an
 * older refresh token falls through to the recently-played call instead of
 * breaking the card.
 */
let scopeWarned = false;

async function fetchCurrentlyPlaying(token: string): Promise<SpotifyTrack | null> {
  const res = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing?additional_types=track",
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  );

  // Said once, because otherwise the card quietly degrades to the last finished
  // track and looks like a Spotify problem rather than a missing scope.
  if ((res.status === 401 || res.status === 403) && !scopeWarned) {
    scopeWarned = true;
    console.warn(
      `[spotify] currently-playing returned ${res.status}: the refresh token has no ` +
        "user-read-currently-playing scope, so the card only shows the last finished " +
        "track. Re-run `npm run spotify:auth` and update SPOTIFY_REFRESH_TOKEN."
    );
    return null;
  }

  // 204 means the request worked and nothing is playing.
  if (res.status === 204 || !res.ok) return null;

  const data = await res.json().catch(() => null);
  if (!data?.is_playing) return null;

  return toTrack(data.item, new Date().toISOString(), true);
}

/** The last finished track, which is also what shows while nothing plays. */
async function fetchRecentlyPlayed(token: string): Promise<SpotifyTrack | null> {
  const res = await fetch(
    "https://api.spotify.com/v1/me/player/recently-played?limit=1",
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  );
  if (!res.ok) return null;

  const data = await res.json();
  const item = data?.items?.[0];
  return toTrack(item?.track, item?.played_at ?? new Date().toISOString(), false);
}

export async function GET() {
  if (cache && Date.now() - cache.at < cache.ttl) {
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
    const result =
      (await fetchCurrentlyPlaying(token)) ??
      (await fetchRecentlyPlayed(token));

    if (!result) {
      return NextResponse.json({ error: "Nothing playing recently" });
    }

    cache = {
      data: result,
      at: Date.now(),
      ttl: result.playing ? PLAYING_CACHE_MS : IDLE_CACHE_MS,
    };
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Spotify unavailable" });
  }
}
