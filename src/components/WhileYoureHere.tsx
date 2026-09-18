"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import {
  BookOpen,
  ExternalLink,
  GitBranch,
  Github,
  Linkedin,
  MessageCircle,
  Music,
  Users,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRevealOnView } from "@/hooks/use-reveal";
import { nowSocials, readingBook, timeAgo } from "@/lib/now";

/* ------------------------------------------------------------------ */
/* Types — the shape of the three API routes                          */
/* ------------------------------------------------------------------ */

type GithubPush = {
  repo: string;
  name: string;
  branch: string;
  message: string;
  url: string;
  pushedAt: string | null;
  isPrivate: boolean;
};

type SpotifyTrack = {
  albumArt: string | null;
  album: string;
  name: string;
  artist: string;
  playedAt: string;
  url: string;
  /** Absent on responses cached before this field existed — treated as false. */
  playing?: boolean;
};

const SOCIAL_ICONS = {
  github: Github,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
} as const;

const COUNTED_KEY = "kamal-visitor-counted";

function delay(ms: number): CSSProperties {
  return { "--reveal-delay": `${ms}ms` } as CSSProperties;
}

/* ------------------------------------------------------------------ */
/* Card 1 — latest push                                                */
/* ------------------------------------------------------------------ */

function GithubCard({ revealDelay }: { revealDelay: number }) {
  const [push, setPush] = useState<GithubPush | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/github")
      .then((res) => res.json())
      .then((data: GithubPush | { error: string }) => {
        if (!alive) return;
        if (data && !("error" in data)) setPush(data as GithubPush);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  // No data means "no public repo to read" — a private repo, or GitHub
  // unreachable. Both land on the same deliberately finished-looking state.
  const isPrivate = !push || push.isPrivate;
  const commitMessage = push?.message ?? "";
  const pushed = timeAgo(push?.pushedAt);

  return (
    <Card
      data-reveal
      style={delay(revealDelay)}
      className="reveal relative justify-between gap-6 border-border/50 p-6 transition-shadow duration-300 hover:shadow-lg"
    >
      <div className="flex items-center gap-2.5">
        <Github className="size-5 text-foreground/80" />
        <span className="text-sm font-semibold">
          Kamal&apos;s{" "}
          <span className="font-normal italic text-muted-foreground">
            GitHub
          </span>
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
            Latest push
          </span>

          {loading ? (
            <span className="h-4 w-14 animate-pulse rounded-full bg-secondary" />
          ) : isPrivate || !pushed ? (
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-500/90">
              private
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
              {pushed}
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-2" aria-hidden>
            <span className="block h-3.5 w-4/5 animate-pulse rounded bg-secondary" />
            <span className="block h-3.5 w-2/5 animate-pulse rounded bg-secondary" />
          </div>
        ) : (
          <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground/90">
            {isPrivate
              ? "Commits happen in a private repo."
              : `"${commitMessage}"`}
          </p>
        )}

        {loading ? (
          <div className="flex items-center gap-3" aria-hidden>
            <span className="h-3.5 w-14 animate-pulse rounded bg-secondary" />
            <span className="h-3.5 w-28 animate-pulse rounded bg-secondary" />
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <GitBranch className="size-3.5" />
              {push?.branch ?? "main"}
            </span>
            <span aria-hidden className="text-border">
              ·
            </span>
            <span>
              Repo:{" "}
              {isPrivate ? (
                <span className="text-amber-600 dark:text-amber-500/80">
                  Private work
                </span>
              ) : (
                <a
                  href={push?.url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-border underline-offset-2 transition-colors hover:text-foreground"
                >
                  {push?.name}
                </a>
              )}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-4">
        {nowSocials.map((social) => {
          const Icon = SOCIAL_ICONS[social.icon];
          return (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon className="size-3.5" />
              {social.label}
            </a>
          );
        })}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Card 2 — visitors                                                   */
/* ------------------------------------------------------------------ */

function VisitorCard({ revealDelay }: { revealDelay: number }) {
  const [count, setCount] = useState<number | null>(null);
  const [counted, setCounted] = useState(false);
  const [pending, setPending] = useState(false);
  const [flash, setFlash] = useState(0);

  useEffect(() => {
    // Remembered visits keep the button settled; the count still comes from
    // the server rather than being cached locally, so it stays truthful.
    try {
      if (window.localStorage.getItem(COUNTED_KEY) === "1") setCounted(true);
    } catch {
      /* private mode — the button just stays available */
    }

    let alive = true;
    fetch("/api/visitors")
      .then((res) => res.json())
      .then((data: { count?: number }) => {
        if (alive && typeof data?.count === "number") setCount(data.count);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const markVisit = async () => {
    if (counted || pending) return;
    setPending(true);

    try {
      const res = await fetch("/api/visitors", { method: "POST" });
      const data = (await res.json()) as { count?: number };
      if (typeof data?.count !== "number") return;

      setCount(data.count);
      setCounted(true);
      setFlash((n) => n + 1);
      try {
        window.localStorage.setItem(COUNTED_KEY, "1");
      } catch {
        /* nothing to remember, still counted */
      }
    } catch {
      /* leave the button available to try again */
    } finally {
      setPending(false);
    }
  };

  return (
    <Card
      data-reveal
      style={delay(revealDelay)}
      className="reveal relative justify-between gap-6 border-border/50 p-6 transition-shadow duration-300 hover:shadow-lg"
    >
      <div className="flex items-center gap-2">
        <Users className="size-4 text-muted-foreground" />
        <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Visitors
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-center gap-1">
        <span
          key={count ?? "pending"}
          className="count-in text-5xl font-bold tabular-nums tracking-tight"
        >
          {count === null ? "—" : count.toLocaleString("en-US")}
        </span>
        <p className="text-xs text-muted-foreground">people have stopped by</p>
      </div>

      <div className="relative">
        <Button
          type="button"
          variant="outline"
          onClick={markVisit}
          disabled={counted || pending}
          aria-pressed={counted}
          className={cn(
            "h-11 w-full rounded-lg text-sm font-medium transition-all disabled:opacity-100",
            counted
              ? "cursor-default border-emerald-500/30 bg-emerald-500/5 text-emerald-600 hover:bg-emerald-500/5 dark:text-emerald-400"
              : "hover:bg-secondary"
          )}
        >
          {counted ? "✓ You're counted" : pending ? "Counting…" : "Mark your visit"}
        </Button>

        {flash > 0 && (
          <span
            key={flash}
            aria-hidden
            className="animate-flash pointer-events-none absolute inset-0 rounded-lg bg-emerald-500/15"
          />
        )}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Card 3 — reading / recently played flip card                        */
/* ------------------------------------------------------------------ */

function SpotifyBadge() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5 shrink-0 fill-[#1DB954]">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

function AlbumArt({
  albumArt,
  isSpinning,
}: {
  albumArt: string | null;
  isSpinning: boolean;
}) {
  return (
    <div
      className={cn(
        "vinyl relative size-28 shrink-0 rounded-full sm:size-32",
        isSpinning && "is-spinning"
      )}
    >
      <div className="absolute inset-0 rounded-full bg-black/75 shadow-2xl ring-1 ring-white/10" />
      {[14, 22, 30, 38].map((inset) => (
        <div
          key={inset}
          className="absolute rounded-full border border-white/[0.07]"
          style={{ inset }}
        />
      ))}
      <div className="absolute inset-[22%] overflow-hidden rounded-full border-2 border-white/10">
        {albumArt ? (
          <Image
            src={albumArt}
            alt=""
            fill
            unoptimized
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="size-full bg-neutral-800" />
        )}
      </div>
      <div className="absolute inset-[45%] z-10 rounded-full border border-white/20 bg-black shadow-lg" />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, transparent 50%, rgba(0,0,0,0.25) 100%)",
        }}
      />
    </div>
  );
}

function FlipCard({ revealDelay }: { revealDelay: number }) {
  const [flipped, setFlipped] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [autoFlip, setAutoFlip] = useState(true);
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [loading, setLoading] = useState(true);

  // This used to fetch once on mount and never again, so a tab left open sat
  // on whatever was playing when it loaded. Now it polls, and re-checks the
  // moment the tab comes back — which is when someone actually looks.
  useEffect(() => {
    let alive = true;

    const load = () => {
      if (document.visibilityState === "hidden") return;

      fetch("/api/spotify")
        .then((res) => res.json())
        .then((data: SpotifyTrack | { error: string }) => {
          if (!alive) return;
          // A failed poll keeps the last known track rather than blanking the
          // card, so a blip never looks like "nothing playing".
          if (data && !("error" in data)) setTrack(data as SpotifyTrack);
        })
        .catch(() => {})
        .finally(() => {
          if (alive) setLoading(false);
        });
    };

    load();
    const id = setInterval(load, 20_000);
    document.addEventListener("visibilitychange", load);
    window.addEventListener("focus", load);

    return () => {
      alive = false;
      clearInterval(id);
      document.removeEventListener("visibilitychange", load);
      window.removeEventListener("focus", load);
    };
  }, []);

  const live = track?.playing === true;

  // A track starting takes the card over — that is the whole point of having
  // it — and the auto-flip is suspended while it plays so it stays on screen.
  useEffect(() => {
    if (live) setFlipped(true);
  }, [live, track?.name]);

  // The card turns over on its own until the visitor takes control, and
  // holds still while the pointer is on it.
  useEffect(() => {
    if (live) return;
    if (!autoFlip || hovered) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => setFlipped((value) => !value), 6500);
    return () => clearInterval(id);
  }, [autoFlip, hovered, live]);

  const flip = () => {
    setAutoFlip(false);
    setFlipped((value) => !value);
  };

  // Spins until the pointer rests on the card, like a needle being lowered.
  const spinning = !hovered;

  return (
    <Card
      data-reveal
      style={delay(revealDelay)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "flip-card reveal relative min-h-[320px] gap-0 overflow-hidden border-border/50 p-0 transition-shadow duration-300 hover:shadow-lg",
        flipped && "is-flipped"
      )}
    >
      <button
        type="button"
        onClick={flip}
        aria-pressed={flipped}
        aria-label={flipped ? "Show what I'm reading" : "Show what I'm listening to"}
        className="absolute right-4 top-4 z-30 flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1.5 text-[10px] font-medium text-muted-foreground backdrop-blur-md transition-colors hover:border-foreground/25 hover:text-foreground"
      >
        {flipped ? (
          <Music className="size-3" />
        ) : (
          <BookOpen className="size-3" />
        )}
        {flipped ? "Spotify" : "Reading"}
      </button>

      <div className="flip-card-inner">
        {/* Front — what I'm reading.
            Only the visible face is announced: the hidden one is still in
            the layout (that is what makes the flip possible), so it has to
            be taken out of the accessibility tree, along with its link. */}
        <div
          onClick={flip}
          aria-hidden={flipped}
          className="flip-face flex cursor-pointer flex-col gap-3 bg-card p-6"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-muted-foreground" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Now Reading
            </span>
          </div>

          <div className="flex flex-1 flex-col justify-center">
            <p className="text-base font-bold leading-snug">
              {readingBook.title}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              by {readingBook.author}
            </p>
            <p className="mt-4 border-l-2 border-border pl-3 text-xs italic leading-relaxed text-muted-foreground">
              &ldquo;{readingBook.thought}&rdquo;
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
            <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              Started {readingBook.startedAt}
            </span>
            <a
              href={readingBook.url}
              target="_blank"
              rel="noreferrer"
              tabIndex={flipped ? -1 : undefined}
              onClick={(event) => event.stopPropagation()}
              className="rounded-full border border-border px-2.5 py-0.5 text-[10px] capitalize text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
            >
              {readingBook.type}
            </a>
          </div>
        </div>

        {/* Back — what I'm listening to */}
        <div className="flip-face flip-face-back bg-card" aria-hidden={!flipped}>
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <span className="size-5 animate-spin rounded-full border border-border border-t-[#1DB954]" />
            </div>
          ) : track ? (
            <div className="relative h-full w-full">
              {track.albumArt && (
                <Image
                  src={track.albumArt}
                  alt=""
                  fill
                  unoptimized
                  sizes="(min-width: 768px) 33vw, 92vw"
                  className="object-cover"
                  style={{ filter: "blur(3px)" }}
                />
              )}
              {/* Sits over album art in both themes, so the text stays white. */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/30" />

              <div className="relative z-10 flex h-full flex-col gap-3 p-6">
                <div className="flex items-center gap-1.5">
                  <SpotifyBadge />
                  <span className="text-[11px] uppercase tracking-[0.2em] text-white/70">
                    {track.playing ? "Now Playing" : "Recently Played"}
                  </span>
                  {track.playing && (
                    <span className="size-1.5 animate-pulse rounded-full bg-[#1DB954]" />
                  )}
                </div>

                <div className="flex flex-1 items-center justify-center">
                  <AlbumArt albumArt={track.albumArt} isSpinning={spinning} />
                </div>

                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold leading-tight text-white">
                      {track.name}
                    </p>
                    <p className="truncate text-xs text-white/70">
                      {track.artist}
                    </p>
                    <p className="mt-0.5 text-[10px] text-white/50">
                      {track.playing ? "now" : timeAgo(track.playedAt)}
                    </p>
                  </div>
                  <a
                    href={track.url}
                    target="_blank"
                    rel="noreferrer"
                    tabIndex={flipped ? undefined : -1}
                    aria-label={`Open ${track.name} on Spotify`}
                    className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/70 backdrop-blur-sm transition-colors hover:border-white/40 hover:text-white"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
              <Music className="size-6" />
              <p className="text-xs">Nothing playing recently</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export default function WhileYoureHere() {
  const sectionRef = useRevealOnView<HTMLElement>();

  return (
    <section id="now" ref={sectionRef} className="relative py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16 space-y-4 text-center">
          <div className="mb-4 inline-block rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-muted-foreground">
            While You&apos;re Here
          </div>
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            A few things happening{" "}
            <span className="font-normal italic text-muted-foreground">
              right now
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            What I&apos;m shipping, reading and listening to in between
            projects
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <GithubCard revealDelay={0} />
          <VisitorCard revealDelay={90} />
          <FlipCard revealDelay={180} />
        </div>
      </div>
    </section>
  );
}
