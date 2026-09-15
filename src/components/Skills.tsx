"use client"

import { Code2, Smartphone, Database, GitBranch, Palette, Zap, Layout, Server } from 'lucide-react'
import { Card } from '@/components/ui/card'

const skills = [
  { name: 'HTML & CSS', icon: Code2, color: 'text-orange-500' },
  { name: 'JavaScript', icon: Zap, color: 'text-yellow-500' },
  { name: 'React', icon: Layout, color: 'text-cyan-500' },
  { name: 'Next.js', icon: Server, color: 'text-white' },
  { name: 'Tailwind CSS', icon: Palette, color: 'text-sky-500' },
  { name: 'Git & GitHub', icon: GitBranch, color: 'text-purple-500' },
  { name: 'Firebase', icon: Database, color: 'text-amber-500' },
  { name: 'Responsive Design', icon: Smartphone, color: 'text-pink-500' },
  { name: 'UI/UX Design', icon: Palette, color: 'text-violet-500' },
]

export default function Skills() {
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
            <Card
              key={skill.name}
              className="group relative p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer border-border/50 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <div className={`p-4 rounded-xl bg-secondary group-hover:bg-secondary/80 transition-colors ${skill.color}`}>
                  <skill.icon className="w-8 h-8" strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-sm">{skill.name}</h3>
              </div>
              
              {/* Glow effect on hover */}
              <div className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl ${skill.color} bg-current -z-10`} />
            </Card>
          ))}
        </div>

        {/* Additional Skills List */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-sm mb-4">Also experienced with</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[ 'PostgreSQL',  'Figma','Node', 'REST'].map((tool) => (
              <span
                key={tool}
                className="px-4 py-2 bg-secondary rounded-full text-sm font-medium hover:bg-secondary/80 transition-colors"
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
