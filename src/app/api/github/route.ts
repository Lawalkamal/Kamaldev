import { NextResponse } from "next/server";

/**
 * Latest commit in a GitHub repo, for the "GitHub" card.
 *
 * GITHUB_REPO   "owner/name" — defaults to the portfolio repo
 * GITHUB_TOKEN  optional; only needed for a private repo or to lift the
 *               unauthenticated rate limit (60 requests/hour per IP)
 *
 * A private repo without a token answers 404, which is not an error here:
 * the card is designed to show its "Private work" state instead.
 */

const DEFAULT_REPO = "Lawalkamal/Kamaldev";

/** Keeps a busy page from hammering the API and the shared rate limit. */
const CACHE_MS = 5 * 60_000;

export type GithubPush = {
  repo: string;
  /** Short "owner/name" for display. */
  name: string;
  branch: string;
  message: string;
  url: string;
  pushedAt: string | null;
  isPrivate: boolean;
};

let cache: { data: GithubPush; at: number } | null = null;

function privateFallback(repo: string): GithubPush {
  return {
    repo,
    name: repo.split("/")[1] ?? repo,
    branch: "main",
    message: "",
    url: `https://github.com/${repo}`,
    pushedAt: null,
    isPrivate: true,
  };
}

export async function GET() {
  if (cache && Date.now() - cache.at < CACHE_MS) {
    return NextResponse.json(cache.data);
  }

  const repo = process.env.GITHUB_REPO?.trim().replace(/^\/+|\/+$/g, "") || DEFAULT_REPO;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "kamal-portfolio",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    // The default branch isn't in the commits payload, so ask for it first.
    const repoRes = await fetch(`https://api.github.com/repos/${repo}`, {
      headers,
      cache: "no-store",
    });
    if (!repoRes.ok) {
      return NextResponse.json(privateFallback(repo));
    }

    const meta = await repoRes.json();
    const branch: string = meta.default_branch ?? "main";

    const commitsRes = await fetch(
      `https://api.github.com/repos/${repo}/commits?per_page=1&sha=${encodeURIComponent(branch)}`,
      { headers, cache: "no-store" }
    );
    if (!commitsRes.ok) {
      return NextResponse.json(privateFallback(repo));
    }

    const commits = await commitsRes.json();
    const latest = Array.isArray(commits) ? commits[0] : null;
    if (!latest?.commit) {
      return NextResponse.json(privateFallback(repo));
    }

    const data: GithubPush = {
      repo,
      name: repo.split("/")[1] ?? repo,
      branch,
      // Commit bodies are multi-line; the card shows the subject only.
      message: String(latest.commit.message ?? "").split("\n")[0].trim(),
      url: latest.html_url ?? `https://github.com/${repo}`,
      pushedAt:
        latest.commit.committer?.date ?? latest.commit.author?.date ?? null,
      isPrivate: false,
    };

    cache = { data, at: Date.now() };
    return NextResponse.json(data);
  } catch {
    // Offline, DNS failure, rate limited — all the same to the card.
    return NextResponse.json(privateFallback(repo));
  }
}
