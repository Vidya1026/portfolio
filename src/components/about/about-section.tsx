'use client';

import React from 'react';

type AboutSectionProps = {
  title?: string;
  aboutMe?: string;                 // optional: pass from SiteSettings
  achievements?: string[] | string; // optional: pass from SiteSettings (array or pipe/newline string)
  className?: string;
};

function toArray(input?: string[] | string): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.filter(Boolean);
  return input
    .split(/\r?\n|\|/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function AboutSection({
  title = 'About Me',
  aboutMe = '',
  achievements = [],
  className = '',
}: AboutSectionProps) {
  const items = toArray(achievements);

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section id="about" className={`relative py-14 md:py-20 ${className}`}>
      {/* subtle decorative glows */}
      <div className="pointer-events-none absolute -top-24 left-1/3 h-56 w-56 -translate-x-1/2 rounded-full bg-violet-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-1/4 h-56 w-56 translate-x-1/3 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="mx-auto max-w-6xl px-4">
        {/* content container (single block, no inner card) */}
        <div
          className={[
            'relative rounded-3xl border border-white/10',
            'bg-white/[0.02] backdrop-blur-[2px]',
            'px-6 py-8 md:px-10 md:py-12',
            'transition-all duration-700 ease-out',
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
            'shadow-[0_10px_40px_-10px_rgba(0,0,0,0.55)]',
          ].join(' ')}
        >
          {/* accent line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

          {/* Heading + paragraph */}
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              {title}
            </h2>
            {aboutMe && (
              <p className="mt-4 text-base md:text-lg text-white/80 leading-relaxed">
                {aboutMe}
              </p>
            )}
          </div>

          {/* Achievements */}
          {items.length > 0 && (
            <div className="mt-8 md:mt-10 mx-auto max-w-4xl">
              <h3 className="sr-only">Key Achievements</h3>
              <ul className="grid gap-3 md:gap-4 sm:grid-cols-2">
                {items.map((line, i) => (
                  <li
                    key={i}
                    className="group relative overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3 text-white/90 shadow-[0_0_0_0_rgba(16,185,129,0)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_30px_-8px_rgba(16,185,129,0.6)]"
                  >
                    <div className="pointer-events-none absolute -inset-px rounded-xl bg-gradient-to-br from-emerald-400/0 via-emerald-400/5 to-emerald-400/0" />
                    <div className="relative flex items-start gap-3">
                      {/* check icon */}
                      <svg
                        aria-hidden
                        viewBox="0 0 24 24"
                        className="mt-0.5 h-5 w-5 flex-none fill-emerald-400/90"
                      >
                        <path d="M9.5 16.2 5.8 12.6a1.2 1.2 0 1 1 1.7-1.7l2.1 2.1 6-6a1.2 1.2 0 0 1 1.7 1.7l-7 7a1.2 1.2 0 0 1-1.7 0Z" />
                      </svg>
                      <span className="text-sm md:text-base leading-relaxed">{line}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}