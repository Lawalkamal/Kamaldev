"use client"

import Link from 'next/link'
import { Github, Linkedin, Twitter, Mail, MessageCircle } from 'lucide-react'
import { useSectionNav } from '@/hooks/use-section-nav'

export default function Footer() {
  const goToSection = useSectionNav()

  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="text-2xl font-bold mb-4">Kamal.</div>
            <p className="text-muted-foreground max-w-xs leading-relaxed">
              Crafting exceptional digital experiences through modern web development and thoughtful design.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {['About', 'Projects', 'Skills', 'Contact'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => goToSection(item.toLowerCase())}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item}
                  </button>
                </li>
              ))}
              <li>
                <Link
                  href="/projects"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  All Projects
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex gap-3">
              {[
                { icon: Github, href: 'https://github.com/Lawalkamal', label: 'GitHub' },
                { icon: Linkedin, href: 'https://www.linkedin.com/in/kamal-lawal-81855b382/', label: 'LinkedIn' },
                { icon: MessageCircle, href: 'https://wa.link/i35awg', label: 'Whatsapp' },
                { icon: Mail, href: 'mailto:lawalkamal595@gmail.com', label: 'Email' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                   target='_blank'
                  className="p-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border">
          <p className="text-center text-sm text-muted-foreground py-6">
            © {new Date().getFullYear()} Kamal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
