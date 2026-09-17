/**
 * Content for the "While You're Here" section.
 *
 * Everything the section shows that isn't fetched at runtime lives here, so
 * the copy (and the book) can be changed without touching the component.
 *
 * The live bits come from three optional sources:
 *   /api/github   -> GITHUB_REPO, GITHUB_TOKEN   (a public repo works with no token)
 *   /api/visitors -> TURSO_DATABASE_URL, TURSO_AUTH_TOKEN (falls back to memory)
 *   /api/spotify  -> SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN
 * None of them are required: the section is designed to look finished with
 * every one of them missing.
 */

export type NowSocialIcon = "github" | "linkedin" | "whatsapp";

export type NowSocial = {
  label: string;
  href: string;
  icon: NowSocialIcon;
};

/** Matches the links in the Contact section, so both stay consistent. */
export const nowSocials: NowSocial[] = [
  { label: "GitHub", href: "https://github.com/Lawalkamal", icon: "github" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/kamal-lawal-81855b382/",
    icon: "linkedin",
  },
  { label: "WhatsApp", href: "https://wa.link/i35awg", icon: "whatsapp" },
];

export type ReadingBook = {
  title: string;
  author: string;
  /** Short badge in the card footer. */
  type: string;
  /** One honest line about the book — shows in quotes. */
  thought: string;
  url: string;
  startedAt: string;
};

/** Edit this to whatever you're actually reading. */
export const readingBook: ReadingBook = {
  title: "The Pragmatic Programmer",
  author: "Andrew Hunt & David Thomas",
  type: "book",
  thought:
    "Every page feels like someone finally put into words what I've been doing wrong.",
  url: "https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/",
  startedAt: "March 2026",
};

/**
 * Turns a timestamp into the compact "2h ago" the cards use.
 * Returns an empty string for a missing or unparseable date so callers can
 * simply skip rendering the badge.
 */
export function timeAgo(iso?: string | null): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";

  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
  });
}
