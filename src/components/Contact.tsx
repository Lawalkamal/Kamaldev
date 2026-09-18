"use client"

import { useRef, useState } from 'react'
import { Mail, MapPin, SendHorizontal, Github, Linkedin, Twitter, CheckCircle2, AlertCircle, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/** How long the plane takes to cross the button. The reply waits for it. */
const FLIGHT_MS = 1040

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  // The send button's own choreography, kept independent of `status` so a fast
  // response can never cut the plane's flight short: 'flying' = the plane drags
  // the label off to the right, 'sent' = the reply has slid in to replace it.
  const [flight, setFlight] = useState<'idle' | 'flying' | 'sent'>('idle')
  const flightStartedAt = useRef(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage('')
    setFlight('flying')
    flightStartedAt.current = Date.now()

    try {
      // Replace 'YOUR_ACCESS_KEY_HERE' with your actual Web3Forms access key
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: '88411e82-805e-43f0-a0b3-cf2f1d22a9d5', // Get this from web3forms.com
          name: formData.name,
          email: formData.email,
          message: formData.message,
          subject: `New Contact Form Submission from ${formData.name}`,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus('success')
        // Reset form
        setFormData({ name: '', email: '', message: '' })

        // Let the plane finish crossing before the reply lands on the button.
        const remaining = Math.max(0, FLIGHT_MS - (Date.now() - flightStartedAt.current))
        setTimeout(() => setFlight('sent'), remaining)

        // Reset success message after 5 seconds
        setTimeout(() => {
          setStatus('idle')
          setFlight('idle')
        }, 5000)
      } else {
        setStatus('error')
        setErrorMessage(data.message || 'Something went wrong. Please try again.')
        // Bring the plane back — the departure was interrupted.
        setFlight('idle')
      }
    } catch (error) {
      setStatus('error')
      setErrorMessage('Failed to send message. Please try again later.')
      setFlight('idle')
      console.error('Form submission error:', error)
    }
  }

  return (
    <section id="contact" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block px-4 py-1.5 bg-secondary rounded-full text-sm font-medium text-muted-foreground mb-4">
            Get In Touch
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Let's Work Together
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have a project in mind? Let's discuss how I can help bring your ideas to life
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-semibold mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-secondary rounded-lg">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-medium mb-1">Email</div>
                    <a href="mailto:lawalkamal595@gmail.com" target='_blank' className="text-muted-foreground hover:text-primary transition-colors">
                      lawalkamal595@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-secondary rounded-lg">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-medium mb-1">Location</div>
                    <div className="text-muted-foreground">
                      Ikeja, Lagos
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-6">Follow Me</h3>
              <div className="flex gap-4">
                {[
                  { icon: Github, label: 'GitHub', href: 'https://github.com/Lawalkamal' },
                  { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/kamal-lawal-81855b382/' },
                  { icon: MessageCircle, label: 'Whatsapp', href: 'https://wa.link/i35awg' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target='_blank'
                    rel="noopener noreferrer"
                    className="p-3 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors group"
                    aria-label={social.label}
                  >
                    <social.icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </a>
                ))}
              </div>
            </div>

            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span
                  aria-hidden
                  className="size-2 shrink-0 animate-pulse rounded-full bg-emerald-500"
                />
                Currently Available
              </h3>
              <p className="text-sm text-muted-foreground">
                I'm actively looking for new opportunities and exciting projects. 
                Let's create something amazing together!
              </p>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="p-8 border-border/50">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="rounded-xl h-12 pl-4"
                  required
                  disabled={status === 'loading'}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="rounded-xl h-12 pl-4"
                  required
                  disabled={status === 'loading'}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message
                </label>
                <Textarea
                  id="message"
                  placeholder="Tell me about your project..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="rounded-xl min-h-[150px] resize-none p-4"
                  required
                  disabled={status === 'loading'}
                />
              </div>

              {/* Success Message (announced to screen readers; the button carries the flavour) */}
              {status === 'success' && (
                <div
                  role="status"
                  aria-live="polite"
                  className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 dark:text-green-400"
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">Message sent successfully!</span>
                </div>
              )}

              {/* Error Message */}
              {status === 'error' && (
                <div
                  role="alert"
                  className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">{errorMessage}</span>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={status === 'loading'}
                className={cn(
                  'group relative w-full overflow-hidden rounded-xl transition-[background-color,box-shadow] duration-[600ms]',
                  // Stay solid while the plane is away — the default disabled dimming would
                  // wash the button out for the whole flight. pointer-events off still guards
                  // against a double submit.
                  'disabled:opacity-100',
                  flight === 'sent' && 'bg-emerald-600 text-white hover:bg-emerald-600'
                )}
              >
                {/* Departing layer — the plane pulls out, dragging the label with it.
                    Travel and fade are split across two elements so they can run on different
                    clocks: the label stays fully opaque for most of the crossing and only
                    dissolves in the last stretch, instead of fading before you can see it move. */}
                <span
                  aria-hidden={flight !== 'idle'}
                  className={cn(
                    'flex items-center justify-center will-change-transform',
                    // NB: Tailwind v4 animates translate-x-*/rotate-* through the `translate`
                    // and `rotate` properties, not `transform` — so those are what must be listed.
                    'transition-[translate] duration-[1040ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
                    flight === 'idle' ? 'translate-x-0' : 'translate-x-[220%]'
                  )}
                >
                  <span
                    className={cn(
                      'flex items-center justify-center gap-2 transition-opacity',
                      flight === 'idle'
                        ? 'opacity-100 delay-0 duration-300'
                        : 'opacity-0 delay-[620ms] duration-200'
                    )}
                  >
                    Send Message
                    <SendHorizontal
                      className={cn(
                        'w-5 h-5 transition-[translate] duration-[1040ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
                        flight === 'idle'
                          ? 'translate-x-0 group-hover:translate-x-1'
                          : 'translate-x-[28px]'
                      )}
                    />
                  </span>
                </span>

                {/* Arriving layer — the reply, which slides in from the left once the plane has landed. */}
                <span
                  aria-hidden={flight !== 'sent'}
                  className={cn(
                    'absolute inset-0 flex items-center justify-center gap-2',
                    'transition-[translate,opacity] duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
                    flight === 'sent'
                      ? 'translate-x-0 opacity-100 delay-100'
                      : '-translate-x-[70%] opacity-0'
                  )}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  I&apos;ll be back soon
                </span>
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  )
}