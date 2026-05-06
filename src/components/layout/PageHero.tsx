import { useEffect, useState } from 'react';
import { Breadcrumb } from './Breadcrumb';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeroProps {
  title: string;
  subtitle?: string;
  breadcrumbItems: BreadcrumbItem[];
}

export function PageHero({ title, subtitle, breadcrumbItems }: PageHeroProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative h-48 md:h-64 flex items-end overflow-hidden bg-accent/20">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="container mx-auto px-4 pb-8 md:pb-10 relative z-10">
        <div
          className={`transition-all duration-700 ease-out ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
        >
          <Breadcrumb items={breadcrumbItems} />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mt-3 font-display">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground mt-2 max-w-xl text-base md:text-lg">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
