"use client"

import { useMemo } from "react"

import { cn } from "@/lib/utils"

/* A Rolls-Royce style starlight ceiling for the nav island.

   Only visible in dark mode: the wrapper is `hidden dark:block`, so in light
   mode nothing here is painted at all and the island is untouched.

   The expensive-looking part is deliberately cheap. The stars are static
   `radial-gradient` layers — one paint for the whole field, no per-frame
   work, no DOM node per star. Only the twinkle and the shooting star
   animate, and only `opacity`/`transform`, which the compositor drives
   without waking the main thread. That matters here: the site scrolls
   through a JS loop, so anything on the main thread competes with scroll. */

/* Deterministic PRNG. The constellation is generated at build/mount time
   rather than hand-authored, but it must be identical on every visit — a
   sky that reshuffles itself would read as a glitch, not as stars. */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* Roughly normal distribution in [-1, 1] from three uniforms — enough to
   scatter a cluster without a hard-edged square of stars. */
function gauss(rand: () => number) {
  return (rand() + rand() + rand() - 1.5) / 1.5
}

/* Where the dense star groups sit. Spread is squashed vertically on use
   because the island is a wide, short pill — an even spread would look
   stretched. */
const CLUSTERS = [
  { x: 15, y: 36, spread: 23 },
  { x: 37, y: 66, spread: 18 },
  { x: 59, y: 30, spread: 24 },
  { x: 83, y: 62, spread: 19 },
] as const

/* Real star fields are not monochrome. These are the classic tints: mostly
   white, a good share of cool blue, and the odd warm star. */
const TINTS = [
  { rgb: "255, 255, 255", upTo: 0.62 },
  { rgb: "214, 228, 255", upTo: 0.84 },
  { rgb: "238, 245, 255", upTo: 0.96 },
  { rgb: "255, 242, 224", upTo: 1 },
] as const

function pickTint(rand: () => number) {
  const roll = rand()
  return TINTS.find((tint) => roll <= tint.upTo)!.rgb
}

function clamp(value: number, min: number, max: number) {
  return value < min ? min : value > max ? max : value
}

type LayerSpec = {
  key: string
  seed: number
  count: number
  minRadius: number
  maxRadius: number
  minAlpha: number
  maxAlpha: number
  /** Bright stars get a soft bloom around them, like a lens would. */
  halo: boolean
  className: string
}

/* Three depth planes. Each is its own element so the twinkle rates can
   drift against each other — that beating is what stops the field from
   reading as one uniformly pulsing sheet. */
const LAYERS: LayerSpec[] = [
  {
    key: "far",
    seed: 0x5eed01,
    count: 46,
    minRadius: 0.55,
    maxRadius: 1,
    minAlpha: 0.2,
    maxAlpha: 0.5,
    halo: false,
    className: "starlight-far",
  },
  {
    key: "mid",
    seed: 0x5eed02,
    count: 32,
    minRadius: 0.85,
    maxRadius: 1.4,
    minAlpha: 0.38,
    maxAlpha: 0.78,
    halo: false,
    className: "starlight-mid",
  },
  {
    key: "near",
    seed: 0x5eed03,
    count: 18,
    minRadius: 1.2,
    maxRadius: 1.9,
    minAlpha: 0.6,
    maxAlpha: 1,
    halo: true,
    className: "starlight-near",
  },
]

function buildStarField(spec: LayerSpec) {
  const rand = mulberry32(spec.seed)
  const paints: string[] = []

  for (let i = 0; i < spec.count; i += 1) {
    // Half the stars go into a cluster, half into the open sky. That mix
    // is what gives the ceiling constellations instead of an even sprinkle.
    let x: number
    let y: number
    if (rand() < 0.5) {
      const cluster = CLUSTERS[Math.floor(rand() * CLUSTERS.length)]
      x = clamp(cluster.x + gauss(rand) * cluster.spread, 1, 99)
      y = clamp(cluster.y + gauss(rand) * cluster.spread * 0.4, 4, 96)
    } else {
      x = 1 + rand() * 98
      y = 4 + rand() * 92
    }

    // Biased toward the small end: many faint points, few bright ones.
    const radius =
      spec.minRadius + rand() ** 1.6 * (spec.maxRadius - spec.minRadius)
    const alpha = spec.minAlpha + rand() * (spec.maxAlpha - spec.minAlpha)
    const tint = pickTint(rand)

    if (spec.halo) {
      paints.push(
        `radial-gradient(circle at ${x.toFixed(2)}% ${y.toFixed(2)}%, rgba(${tint}, ${(alpha * 0.2).toFixed(3)}) 0px, rgba(${tint}, 0) ${(radius * 4.5).toFixed(1)}px)`,
      )
    }

    // Solid core, soft edge — a hard-edged dot reads as noise, a soft one
    // reads as light.
    paints.push(
      `radial-gradient(circle at ${x.toFixed(2)}% ${y.toFixed(2)}%, rgba(${tint}, ${alpha.toFixed(3)}) 0px, rgba(${tint}, ${(alpha * 0.8).toFixed(3)}) ${(radius * 0.5).toFixed(2)}px, rgba(${tint}, 0) ${radius.toFixed(2)}px)`,
    )
  }

  return paints.join(", ")
}

export default function StarlightHeadliner({ className }: { className?: string }) {
  const layers = useMemo(
    () =>
      LAYERS.map((spec) => ({
        ...spec,
        backgroundImage: buildStarField(spec),
      })),
    [],
  )

  return (
    <div
      aria-hidden
      className={cn(
        "starlight pointer-events-none absolute inset-0 hidden overflow-hidden rounded-[inherit] dark:block",
        className,
      )}
    >
      {/* Sky behind the stars: a near-black wash with two faint nebulae so
          the points sit in depth rather than on flat black. */}
      <span className="starlight-nebula absolute inset-0" />

      {layers.map((layer) => (
        <span
          key={layer.key}
          className={cn(
            "starlight-layer absolute inset-0",
            layer.className,
          )}
          style={{ backgroundImage: layer.backgroundImage }}
        />
      ))}

      {/* Lit trim, as on the real thing — a hairline catching light along
          the front edge of the ceiling. */}
      <span className="starlight-sheen absolute inset-x-12 top-0 h-px" />

      {/* An occasional meteor crossing the ceiling. */}
      <span className="starlight-shoot absolute inset-0">
        <span className="starlight-trail absolute left-0 top-[42%] h-px w-24 rotate-6" />
      </span>
    </div>
  )
}
