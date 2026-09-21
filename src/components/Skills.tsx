"use client"

import { useState } from 'react'
import type { AnimationEvent, KeyboardEvent } from 'react'
import { Code2, Smartphone, Database, GitBranch, Palette, Zap, Layout, Server, Bot, BotMessageSquare } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const skills = [
  { name: 'HTML & CSS', icon: Code2, color: 'text-orange-500' },
  { name: 'JavaScript', icon: Zap, color: 'text-yellow-500' },
  { name: 'React', icon: Layout, color: 'text-cyan-500' },
  { name: 'Next.js', icon: Server, color: 'text-gray-500' },
  { name: 'Tailwind CSS', icon: Palette, color: 'text-sky-500' },
  { name: 'Git & GitHub', icon: GitBranch, color: 'text-purple-500' },
  { name: 'Firebase', icon: Database, color: 'text-amber-500' },
  { name: 'Responsive Design', icon: Smartphone, color: 'text-pink-500' },
  { name: 'UI/UX Design', icon: Palette, color: 'text-violet-500' },
  { name: 'AI Integration', icon: Bot, color: 'text-green-500' },
  { name: 'Telegram Bot Development', icon: BotMessageSquare, color: 'text-blue-500' }
]

const alsoExperienced = ['PostgreSQL', 'Figma', 'Node', 'REST']

export default function Skills() {
  // A list rather than a single key: popping one card while another is still
  // wobbling must not cut the first one's animation short. Each key is
  // dropped when its own `skill-pop` animation ends, and the class going away
  // is what returns the card to rest — the layout is never altered.
  const [popping, setPopping] = useState<string[]>([])

  const pop = (key: string) =>
    setPopping((prev) => (prev.includes(key) ? prev : [...prev, key]))

  const settle =
    (key: string) => (event: AnimationEvent<HTMLElement>) => {
      if (event.animationName !== 'skill-pop') return
      setPopping((prev) => prev.filter((item) => item !== key))
    }

  const popProps = (key: string) => ({
    role: 'button' as const,
    tabIndex: 0,
    'aria-label': `${key} — click to play`,
    onClick: () => pop(key),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      // Space would otherwise scroll the page before the pop is seen.
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        pop(key)
      }
    },
    onAnimationEnd: settle(key)
  })

  return (
    <section id="skills" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block px-4 py-1.5 bg-secondary rounded-full text-sm font-medium text-muted-foreground mb-4">
            Tools I Use
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Tech Stack & Skills
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Technologies and tools I work with to build exceptional digital products
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {skills.map((skill, index) => (
            /* The entrance animation lives on the wrapper and the pop on the
               card, so the stagger's inline `animation-delay` cannot leak into
               the click animation and hold it back. */
            <div
              key={skill.name}
              className="animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Card
                {...popProps(skill.name)}
                className={cn(
                  'group relative h-full p-8 cursor-pointer border-border/50',
                  'transition-[transform,box-shadow,border-color] duration-300',
                  'hover:shadow-xl hover:-translate-y-2',
                  'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                  popping.includes(skill.name) && 'skill-pop',
                )}
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <div className={cn('skill-icon p-4 rounded-xl bg-secondary group-hover:bg-secondary/80 transition-colors', skill.color)}>
                    <skill.icon className="w-8 h-8" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-semibold text-sm">{skill.name}</h3>
                </div>

                {/* Glow effect on hover */}
                <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl ${skill.color} bg-current -z-10`} />
              </Card>
            </div>
          ))}
        </div>

        {/* Additional Skills List */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-sm mb-4">Also experienced with</p>
          <div className="flex flex-wrap justify-center gap-3">
            {alsoExperienced.map((tool) => (
              <span
                key={tool}
                {...popProps(tool)}
                className={cn(
                  'inline-block px-4 py-2 bg-secondary rounded-full text-sm font-medium cursor-pointer',
                  'transition-colors hover:bg-secondary/80',
                  'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                  popping.includes(tool) && 'skill-pop',
                )}
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
