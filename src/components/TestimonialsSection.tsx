import { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Star, Quote } from 'lucide-react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { initialTestimonials } from '@/data/testimonials';
import { Testimonial } from '@/types';

export function TestimonialsSection() {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });
  const [testimonials] = useLocalStorage<Testimonial[]>(
    'medifranco_testimonials',
    initialTestimonials
  );
  
  const activeTestimonials = testimonials.filter((t) => t.isActive);

  const [emblaRef] = useEmblaCarousel(
    { loop: true, align: 'start' },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  return (
    <section id="testemunhos" className="py-16 md:py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              O que dizem os nossos <span className="text-primary">Pacientes</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              A satisfação dos nossos pacientes é a nossa maior recompensa.
            </p>
          </div>

          {/* Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {activeTestimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="flex-none w-full sm:w-1/2 lg:w-1/3 min-w-0"
                >
                  <div className="bg-secondary/50 rounded-2xl p-6 h-full relative">
                    <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
                    
                    {/* Rating */}
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < testimonial.rating
                              ? 'text-primary fill-primary'
                              : 'text-muted'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Content */}
                    <p className="text-foreground/80 mb-4 italic leading-relaxed">
                      "{testimonial.content}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {testimonial.clientName.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-foreground">
                        {testimonial.clientName}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
