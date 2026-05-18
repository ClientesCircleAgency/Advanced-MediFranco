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
  backgroundImage?: string;
  backgroundPosition?: string;
  align?: 'left' | 'center';
}

export function PageHero({
  title,
  subtitle,
  breadcrumbItems,
  backgroundImage,
  backgroundPosition = 'center center',
  align = 'left',
}: PageHeroProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-[430px] md:min-h-[560px] lg:min-h-[620px] flex items-end overflow-hidden bg-foreground">
      {backgroundImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-[1.02]"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundPosition,
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-foreground to-accent/20" />
      )}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_35%,rgba(20,184,166,0.28),transparent_34%),linear-gradient(90deg,rgba(15,23,42,0.88)_0%,rgba(15,23,42,0.66)_38%,rgba(15,23,42,0.25)_68%,rgba(15,23,42,0.08)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <div className="container mx-auto px-4 pb-14 pt-32 md:pb-20 relative z-10">
        <div
          className={`max-w-3xl transition-all duration-700 ease-out ${
            align === 'center' ? 'mx-auto text-center' : ''
          } ${
            isVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="[&_nav]:text-white/75 [&_nav_svg]:text-white/45 [&_nav_span]:text-white/75 [&_a]:text-white/75 [&_a:hover]:text-white">
            <Breadcrumb items={breadcrumbItems} />
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mt-5 font-display tracking-tight leading-[0.98] drop-shadow-sm">
            {title}
          </h1>
          {subtitle && (
            <p className={`text-white/85 mt-5 max-w-2xl text-base md:text-xl leading-relaxed drop-shadow-sm ${
              align === 'center' ? 'mx-auto' : ''
            }`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
