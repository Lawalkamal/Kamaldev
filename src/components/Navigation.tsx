"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Sun, Moon, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSectionNav } from '@/hooks/use-section-nav'
import { scrollToTop } from '@/lib/smooth-scroll'
import ScrollProgress from '@/components/ScrollProgress'
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
  const { theme, setTheme, resolvedTheme } = useTheme()
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
            'pointer-events-auto flex w-full max-w-fit flex-col rounded-full border backdrop-blur-xl',
            'transition-[background-color,border-color,box-shadow,border-radius] duration-300 ease-out',
            scrolled
              ? 'border-border/70 bg-background/75 shadow-[0_10px_34px_-16px_rgba(0,0,0,0.3)]'
              : 'border-border/50 bg-background/55 shadow-[0_8px_28px_-18px_rgba(0,0,0,0.2)]',
            mobileMenuOpen && 'max-w-full rounded-3xl',
          )}
        >
          <div className="flex items-center gap-1 p-2">
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
                {resolvedTheme === 'dark' ? (
                  <Sun className="size-[18px]" />
                ) : (
                  <Moon className="size-[18px]" />
                )}
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
            <div className="border-t border-border/60 px-3 pb-3 pt-2 md:hidden">
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
