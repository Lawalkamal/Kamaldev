This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# P-o-r-t-f-o-l-i-o

## "While You're Here" section

The three cards on the landing page (`src/components/WhileYoureHere.tsx`) read
from three API routes. **All of them are optional** — with nothing configured
the section still looks finished: the GitHub card falls back to its "Private
work" state, the visitor count just starts from wherever the server is, and the
flip card shows "Nothing playing recently".

Copy set in stone (social links, the book) lives in `src/lib/now.ts`.

| Variable | Needed for | Notes |
| --- | --- | --- |
| `GITHUB_REPO` | Latest-push card | `owner/name`. Defaults to `Lawalkamal/Kamaldev`. A public repo needs nothing else. |
| `GITHUB_TOKEN` | Latest-push card | Only for a private repo, or to lift the unauthenticated rate limit (60/hr per IP). |
| `TURSO_DATABASE_URL` | Visitor counter | libsql/Turso database. Without it the count is kept in memory and resets when the server process is recycled. |
| `TURSO_AUTH_TOKEN` | Visitor counter | Paired with the URL above. |
| `SPOTIFY_CLIENT_ID` | Flip card (Spotify face) | From a [Spotify app](https://developer.spotify.com/dashboard). |
| `SPOTIFY_CLIENT_SECRET` | Flip card (Spotify face) | Same app as above. |
| `SPOTIFY_REFRESH_TOKEN` | Flip card (Spotify face) | One-time Authorization Code flow with the `user-read-recently-played` scope. It does not expire. |

Put them in `.env.local` (already git-ignored). On Vercel, add the same names
under Project Settings → Environment Variables.

### Spotify, step by step

1. Open <https://developer.spotify.com/dashboard> → **Create app**.
2. **Redirect URI** — use exactly this. Spotify rejects `localhost` and requires
   an explicit loopback address:

   ```
   http://127.0.0.1:8123/callback
   ```

3. Put the **Client ID** and **Client secret** in `.env.local`:

   ```
   SPOTIFY_CLIENT_ID=...
   SPOTIFY_CLIENT_SECRET=...
   ```

4. Mint the refresh token (opens your browser once, then writes itself into
   `.env.local`):

   ```bash
   npm run spotify:auth
   ```

   Different port? `npm run spotify:auth -- --port=9000` — and register the
   matching redirect URI on the dashboard.

The refresh token does not expire, so this is a one-time step. Re-run it if you
reset the app's client secret, or if the server logs
`[spotify] token refresh failed`. On Vercel only the three variables matter —
the redirect URI is used by the local script alone.
