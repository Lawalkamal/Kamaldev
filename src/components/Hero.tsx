"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { scrollToElement } from "@/lib/smooth-scroll";

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    // Leave the parallax out entirely when it cannot be paid for: reduced
    // motion, touch devices, or an unhurried connection.
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const coarse = window.matchMedia(
      "(hover: none) and (pointer: coarse)",
    ).matches;
    if (reduced || coarse) return;

    // Cached once here instead of queried on every pointer move.
    const shapes = Array.from(
      hero.querySelectorAll<HTMLElement>(".floating-shape"),
    );
    if (!shapes.length) return;

    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;

    const apply = () => {
      frame = 0;
      const { innerWidth, innerHeight } = window;
      const offsetX = pointerX - innerWidth / 2;
      const offsetY = pointerY - innerHeight / 2;

      for (let index = 0; index < shapes.length; index += 1) {
        const speed = (index + 1) * 0.01;
        shapes[index].style.transform = `translate3d(${offsetX * speed}px, ${
          offsetY * speed
        }px, 0)`;
      }
    };

    // Pointer moves are coalesced into a single write per frame.
    const handleMouseMove = (event: MouseEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (frame === 0) frame = requestAnimationFrame(apply);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const scrollToSection = (id: string) => {
    scrollToElement(document.getElementById(id));
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Abstract Shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="floating-shape absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl transition-transform duration-700 ease-out" />
        <div className="floating-shape absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl transition-transform duration-700 ease-out" />
        <div className="floating-shape absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl transition-transform duration-700 ease-out" />
      </div>

      <div
        ref={heroRef}
        className="relative max-w-7xl mx-auto px-6 lg:px-8 py-32 z-10"
      >
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-block">
              {/* Same live dot as the "Latest push" badge in the
                  "While You're Here" card, so availability reads
                  identically everywhere it appears. */}
              <span className="inline-flex items-center gap-2 px-2 py-2 bg-secondary rounded-full text-sm font-medium">
                Available for freelance
                <span
                  aria-hidden
                  className="size-2 shrink-0 animate-pulse rounded-full bg-emerald-500"
                />
              </span>
            </div>

            {/* Syne Tactile is the display face for the headline only — a
                single-weight, hand-drawn face, so it carries no bold class;
                `.hero-display` thickens the strokes with a text-stroke. */}
            <h1 className="hero-display font-tactile text-5xl md:text-6xl lg:text-7xl font-normal leading-tight tracking-tight">
              Web Developer,
              <br />
              <span className="text-muted-foreground"> UI Designer</span>
              <span className="text-foreground"> & AI Agent Engineer</span>
            </h1>

            <p className="subtle-weight text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
              I craft exceptional digital experiences through modern web
              development, clean code architecture, and pixel-perfect UI design.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                onClick={() => scrollToSection("projects")}
                className="group rounded-lg px-8 text-base hover:scale-105 transition-all"
              >
                View Projects
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              {/* <Button 
                size="lg"
                variant="outline"
                className="rounded-lg px-8 text-base hover:scale-105 transition-all"
              >
                <Download className="mr-2 w-5 h-5" />
                Download Resume
              </Button> */}
            </div>

            {/* Stats */}
            <div className="flex gap-12 pt-8 border-t border-border">
              <div>
                <div className="text-3xl font-bold">2+</div>
                <div className="text-sm text-muted-foreground">
                  Years Experience
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold">25+</div>
                <div className="text-sm text-muted-foreground">
                  Projects Completed
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold">15+</div>
                <div className="text-sm text-muted-foreground">
                  Happy Clients
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Visual */}
          <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
            <Image
              src="https://res.cloudinary.com/dxhjlkdx0/image/upload/v1764942555/ovc2mjaidgsntcdkls82.png"
              alt="Developer portrait"
              width={800}
              height={800}
              priority
              className="object-cover w-full h-full"
            />
            {/* <div className="relative aspect-square">
              
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-secondary via-card to-secondary border border-border shadow-2xl overflow-hidden">
                <div className="absolute inset-0 p-8">
                  
                  <div className="space-y-4 font-mono text-sm opacity-60">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="space-y-2 pt-4">
                      <div className="h-2 bg-primary/20 rounded w-3/4" />
                      <div className="h-2 bg-primary/10 rounded w-full" />
                      <div className="h-2 bg-primary/20 rounded w-5/6" />
                      <div className="h-2 bg-primary/10 rounded w-2/3" />
                      <div className="h-2 bg-primary/20 rounded w-4/5" />
                      <div className="h-2 bg-primary/10 rounded w-full" />
                      <div className="h-2 bg-primary/20 rounded w-3/5" />
                      <div className="h-2 bg-primary/10 rounded w-5/6" />
                    </div>
                  </div>
                  
                  
                  <div className="absolute bottom-8 right-8 w-48 h-32 bg-card rounded-xl border border-border shadow-xl p-4 animate-float">
                    <div className="space-y-2">
                      <div className="h-3 bg-primary/20 rounded w-2/3" />
                      <div className="h-2 bg-primary/10 rounded w-full" />
                      <div className="h-2 bg-primary/10 rounded w-4/5" />
                    </div>
                  </div>
                </div>
              </div>
              
              
              <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl -z-10" />
            </div> */}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-muted-foreground rounded-full p-1">
          <div className="w-1 h-2 bg-muted-foreground rounded-full mx-auto animate-scroll" />
        </div>
      </div>
    </section>
  );
}
