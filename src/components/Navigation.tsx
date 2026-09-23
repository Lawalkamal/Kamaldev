"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Sun, Moon, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSectionNav } from '@/hooks/use-section-nav'
import { scrollToTop } from '@/lib/smooth-scroll'
import ScrollProgress from '@/components/ScrollProgress'
import StarlightHeadliner from '@/components/StarlightHeadliner'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
] as const

export default function Navigation() {
  const goToSection = useSectionNav()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()
  const scrolledRef = useRef(false)

  useEffect(() => {
    // Only re-render when the header actually changes state, not every frame.
    const handleScroll = () => {
      const next = window.scrollY > 50
      if (next === scrolledRef.current) return
      scrolledRef.current = next
      setScrolled(next)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Which section owns the middle of the viewport. The band is narrow
  // (rootMargin) so at most one section can be crossing it, and the observer
  // only fires on transitions — nothing here runs per scroll frame.
  useEffect(() => {
    const sections = NAV_LINKS.map((link) =>
      document.getElementById(link.id),
    ).filter((el): el is HTMLElement => el !== null)
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entering = entries.find((entry) => entry.isIntersecting)
        if (!entering) return
        const id = entering.target.id
        setActive((prev) => (prev === id ? prev : id))
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  // Escape closes the mobile menu, and so does growing back to a desktop width.
  useEffect(() => {
    if (!mobileMenuOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false)
    }
    const wide = window.matchMedia('(min-width: 768px)')
    const onWide = () => {
      if (wide.matches) setMobileMenuOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    wide.addEventListener('change', onWide)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      wide.removeEventListener('change', onWide)
    }
  }, [mobileMenuOpen])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  // The logo goes home from other routes, and to the top when already here.
  const handleLogo = () => {
    setMobileMenuOpen(false)
    if (window.location.pathname === '/') scrollToTop()
  }

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false)
    // Optimistic: the highlight lands with the click, not when the scroll ends.
    setActive(id)
    goToSection(id)
  }

  const iconButton =
    'grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground'

  return (
    <>
      <ScrollProgress />

      {/* Navigation — a glass island floating over the page. The wrapper only
          positions it, so it stays click-through; the island takes the
          pointer back. */}
      <nav className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
        <div
          className={cn(
            'pointer-events-auto relative flex w-full max-w-fit flex-col overflow-hidden rounded-full border backdrop-blur-xl dark:backdrop-blur-none',
            'transition-[background-color,border-color,box-shadow,border-radius] duration-300 ease-out',
            // In dark mode the island is the starlight ceiling, so it sits
            // darker and far more opaque than the light glass: the stars
            // need a night to be seen against, and a blurred page behind
            // them would wash the field out. At this opacity there is
            // nothing left to see through it, so the backdrop blur is
            // dropped in dark mode too — that is a fixed element re-blurring
            // its backdrop on every scroll frame, for no visible result.
            scrolled
              ? 'border-border/70 bg-background/75 shadow-[0_10px_34px_-16px_rgba(0,0,0,0.3)] dark:border-white/[0.09] dark:bg-[#06060d]/94'
              : 'border-border/50 bg-background/55 shadow-[0_8px_28px_-18px_rgba(0,0,0,0.2)] dark:border-white/[0.07] dark:bg-[#06060d]/88',
            mobileMenuOpen && 'max-w-full rounded-3xl',
          )}
        >
          <StarlightHeadliner />

          <div className="relative flex items-center gap-1 p-2">
            {/* Logo */}
            <Link
              href="/"
              onClick={handleLogo}
              aria-label="Kamal — back to top"
              className="flex shrink-0 items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-secondary/60"
            >
              <span className="grid size-8 place-items-center rounded-full bg-foreground text-[13px] font-bold text-background">
                K
              </span>
              <span className="hidden text-sm font-semibold tracking-tight sm:inline">
                Kamal.
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden items-center gap-0.5 md:flex">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  aria-current={active === link.id ? 'true' : undefined}
                  className={cn(
                    'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                    active === link.id
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                  )}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <span
              aria-hidden
              className="mx-1 hidden h-5 w-px shrink-0 bg-border md:block"
            />

            {/* Right Side Actions */}
            <div className="ml-auto flex items-center gap-1 md:ml-0">
              <button
                onClick={toggleTheme}
                className={iconButton}
                aria-label="Toggle theme"
              >
                {/* Both icons are rendered and CSS picks one off the `.dark`
                    class. Branching on `resolvedTheme` at render time meant
                    the server always sent the moon and a dark-mode visitor's
                    first client render produced the sun — a hydration
                    mismatch that made React throw away and rebuild this
                    subtree on every load. The class is set before paint, so
                    the right icon still shows immediately either way. */}
                <Moon className="size-[18px] dark:hidden" />
                <Sun className="hidden size-[18px] dark:block" />
              </button>

              <Button
                onClick={() => scrollToSection('contact')}
                className="hidden rounded-full px-5 hover:scale-105 transition-transform md:inline-flex"
              >
                Hire Me
              </Button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={cn(iconButton, 'md:hidden')}
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="size-5" />
                ) : (
                  <Menu className="size-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu — the island itself unfolds, so there is no second
              surface appearing out of nowhere. */}
          {mobileMenuOpen && (
            <div className="relative border-t border-border/60 px-3 pb-3 pt-2 md:hidden">
              <div className="flex flex-col gap-0.5">
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className={cn(
                      'rounded-2xl px-4 py-2.5 text-left text-sm font-medium transition-colors',
                      active === link.id
                        ? 'bg-secondary text-foreground'
                        : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                    )}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
              <Button
                onClick={() => scrollToSection('contact')}
                className="mt-3 w-full rounded-2xl"
              >
                Hire Me
              </Button>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}
