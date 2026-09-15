"use client"

import { useEffect } from 'react'
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import Skills from '@/components/Skills'
import About from '@/components/About'
import Projects from '@/components/Projects'
import Testimonials from '@/components/Testimonials'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import BackToTop from '@/components/BackToTop'
import PageTransition from '@/components/PageTransition'
import { hasRevealed, subscribeReveal } from '@/lib/reveal-store'
import { scrollToElement } from '@/lib/smooth-scroll'

export default function Home() {
  // Support deep links like /#projects coming from other pages. The wait for
  // the curtain matters: scrolling is locked while the preloader is up.
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (!hash) return

    const timers: ReturnType<typeof setTimeout>[] = []

    const go = () => {
      // One frame of grace so the section is laid out before measuring it.
      timers.push(
        setTimeout(() => {
          const element = document.getElementById(hash)
          scrollToElement(element)
          if (!element) return

          // Images above the target load lazily and push it down, so the
          // landing spot gets one quiet correction. Skipped if the visitor
          // has started scrolling themselves in the meantime.
          const landedAt = window.scrollY
          timers.push(
            setTimeout(() => {
              if (Math.abs(window.scrollY - landedAt) > 80) return
              const drift = element.getBoundingClientRect().top
              if (Math.abs(drift) > 40) scrollToElement(element)
            }, 600)
          )
        }, 60)
      )
    }

    if (hasRevealed()) {
      go()
      return () => timers.forEach(clearTimeout)
    }

    const unsubscribe = subscribeReveal(go)
    return () => {
      timers.forEach(clearTimeout)
      unsubscribe()
    }
  }, [])

  return (
    <div className="relative">
      <Navigation />
      <PageTransition>
        <Hero />
        <Skills />
        <About />
        <Projects />
        <Testimonials />
        <Contact />
      </PageTransition>
      <Footer />
      <BackToTop />
    </div>
  )
}
