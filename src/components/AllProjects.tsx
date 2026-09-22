"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink, Github } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSectionNav } from "@/hooks/use-section-nav";
import { projects, projectCategories } from "@/lib/projects";

export default function AllProjects() {
  const [activeCategory, setActiveCategory] = useState("All");
  const goToSection = useSectionNav();

  const filteredProjects = useMemo(
    () =>
      activeCategory === "All"
        ? projects
        : projects.filter((project) => project.category === activeCategory),
    [activeCategory]
  );

  return (
    <>
      {/* Header */}
      <section className="relative pt-40 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute top-10 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="space-y-4 max-w-3xl">
            <div className="inline-block px-4 py-1.5 bg-secondary rounded-full text-sm font-medium text-muted-foreground">
              Portfolio
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              All Projects
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Everything I have designed and built — from full-stack web
              applications to UI design work. Pick a category to narrow things
              down.
            </p>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="pb-24 bg-secondary/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12">
            <div className="flex flex-wrap gap-2">
              {projectCategories.map((category) => {
                const isActive = category === activeCategory;
                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    aria-pressed={isActive}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <p className="text-sm text-muted-foreground shrink-0">
              Showing {filteredProjects.length} of {projects.length} projects
            </p>
          </div>

          {/* Grid */}
          {filteredProjects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project, index) => (
                <Card
                  key={project.title}
                  className="group overflow-hidden hover:shadow-2xl transition-[transform,box-shadow] duration-500 p-0 border-border/50 animate-in fade-in slide-in-from-bottom-6"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <Image
                      src={project.image}
                      alt={project.title}
                      width={800}
                      height={600}
                      sizes="(min-width: 1280px) 400px, (min-width: 1024px) 31vw, (min-width: 768px) 46vw, 92vw"
                      // Decoded off the main thread, so a grid of thumbnails
                      // does not stutter while it scrolls in.
                      decoding="async"
                      className="object-cover w-full h-full transform-gpu will-change-transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <span className="absolute top-4 left-4 px-3 py-1 bg-card/90 backdrop-blur-sm rounded-full text-xs font-medium border border-border">
                      {project.category}
                    </span>

                    {/* Action buttons on hover */}
                    <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="sm"
                        className="rounded-lg shadow-lg"
                        onClick={() => window.open(project.link, "_blank")}
                        disabled={project.link === "#"}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Live
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg shadow-lg bg-card/90 backdrop-blur-sm"
                        onClick={() => window.open(project.github, "_blank")}
                        disabled={project.github === "#"}
                      >
                        <Github className="w-4 h-4 mr-2" />
                        Code
                      </Button>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">
                      {project.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-secondary rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-16 text-center border-border/50">
              <h2 className="text-xl font-semibold mb-2">
                Nothing here yet
              </h2>
              <p className="text-muted-foreground">
                This category does not have any projects yet. Try another one.
              </p>
            </Card>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Have a project in mind?
          </h2>
          <p className="text-lg text-muted-foreground">
            I am currently available for freelance work and collaborations.
            Let&apos;s build something great together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Button
              size="lg"
              className="group rounded-lg px-8 hover:scale-105 transition-transform"
              onClick={() => goToSection("contact")}
            >
              Start a Conversation
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-lg px-8"
            >
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
