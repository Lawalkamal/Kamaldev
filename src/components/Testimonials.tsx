"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "CEO at TechStart",
    image: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=random",
    content:
      "Working with this developer was an absolute pleasure. The attention to detail and technical expertise resulted in a product that exceeded our expectations. Highly recommended for any serious project.",
  },
  {
    name: "Michael Chen",
    role: "Product Manager at DataFlow",
    image: "https://ui-avatars.com/api/?name=Michael+Chen&background=random",
    content:
      "Exceptional work on our dashboard redesign. The UI is clean, intuitive, and our users love it. The code quality is top-notch and the project was delivered on time.",
  },
  {
    name: "Emily Rodriguez",
    role: "Founder of CreativeHub",
    image: "https://ui-avatars.com/api/?name=Emily+Rodriguez&background=random",
    content:
      "A true professional who understands both design and development. The final product is beautiful, fast, and exactly what we needed. Communication throughout was excellent.",
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((current + 1) % testimonials.length);
  const prev = () =>
    setCurrent((current - 1 + testimonials.length) % testimonials.length);

  return (
    <section id="testimonials" className="py-32 relative">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-block px-4 py-1.5 bg-secondary rounded-full text-sm font-medium text-muted-foreground mb-4">
            Testimonials
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            What Clients Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Don't just take my word for it — hear from people I've worked with
          </p>
        </div>

        <Card className="relative p-8 md:p-12 border-border/50">
          <Quote className="absolute top-8 left-8 w-12 h-12 text-primary/10" />

          <div className="relative space-y-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className={`transition-all duration-500 ${
                  index === current ? "opacity-100 block" : "opacity-0 hidden"
                }`}
              >
                <p className="text-xl md:text-2xl leading-relaxed mb-8">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-border">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">
                      {testimonial.name}
                    </div>
                    <div className="text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-8 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={prev}
              className="rounded-lg"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Previous
            </Button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === current
                      ? "bg-primary w-8"
                      : "bg-muted-foreground/30"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={next}
              className="rounded-lg"
            >
              Next
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
