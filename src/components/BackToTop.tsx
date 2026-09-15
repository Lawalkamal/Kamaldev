"use client"

import { useState, useEffect, useRef } from 'react'
import { ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { scrollToTop } from '@/lib/smooth-scroll'

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const visibleRef = useRef(false)

  useEffect(() => {
    const toggleVisibility = () => {
      const next = window.scrollY > 500
      if (next === visibleRef.current) return
      visibleRef.current = next
      setIsVisible(next)
    }

    toggleVisibility()
    window.addEventListener('scroll', toggleVisibility, { passive: true })
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  return (
    <>
      {isVisible && (
        <Button
          onClick={() => scrollToTop()}
          size="icon"
          className="fixed bottom-8 right-8 z-50 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 animate-in fade-in slide-in-from-bottom-4"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}
    </>
  )
}
