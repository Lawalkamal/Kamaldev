"use client"

import Image from 'next/image'
import { CheckCircle2 } from 'lucide-react'

export default function About() {
  return (
    <section id="about" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Image */}
          <div className="relative animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="relative aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent blur-2xl" />
              <div className="relative rounded-3xl overflow-hidden border border-border bg-card shadow-2xl">
                <Image
                  src="https://res.cloudinary.com/dxhjlkdx0/image/upload/v1764942555/ovc2mjaidgsntcdkls82.png"
                  alt="Developer portrait"
                  width={800}
                  height={800}
                  className="object-cover w-full h-full"
                />
              </div>
              
              {/* Floating badge */}
              <div className="absolute -bottom-6 -right-6 bg-card border border-border rounded-2xl p-6 shadow-xl animate-float">
                <div className="text-center">
                  <div className="text-3xl font-bold">2+</div>
                  <div className="text-sm text-muted-foreground">Years</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Content */}
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-1000">
            <div>
              <div className="inline-block px-4 py-1.5 bg-secondary rounded-full text-sm font-medium text-muted-foreground mb-6">
                Who I Am
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Building digital products that matter
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                I'm a full-stack developer and UI designer with a passion for creating 
                seamless digital experiences. I combine technical expertise with creative 
                design thinking to build products that users love.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">What makes me different</h3>
              <div className="space-y-3">
                {[
                  'Clean, maintainable code architecture',
                  'User-centric design approach',
                  'Strong attention to detail and polish',
                  'Fast turnaround without compromising quality',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <h3 className="text-xl font-semibold mb-4">My workflow</h3>
              <p className="text-muted-foreground leading-relaxed">
                I start by understanding your business goals and user needs. Then I design 
                intuitive interfaces, write clean code, and iterate based on feedback. 
                The result? Digital products that look great and work flawlessly.
              </p>
            </div>

            <div className="pt-6">
              <h3 className="text-xl font-semibold mb-4">Development philosophy</h3>
              <p className="text-muted-foreground leading-relaxed">
                Quality over quantity. Every project deserves attention to detail. 
                I believe in writing code that's not just functional, but elegant and 
                scalable. Good design isn't just how it looks—it's how it works.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
