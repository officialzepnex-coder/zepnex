'use client';
import React, { useEffect, useRef } from 'react';

const words = [
  { text: 'From', italic: false },
  { text: 'your', italic: false },
  { text: 'morning', italic: false },
  { text: 'essentials', italic: true },
  { text: 'to', italic: false },
  { text: 'weekend', italic: false },
  { text: 'fashion', italic: true },
  { text: '—', italic: false },
  { text: 'BrandMart', italic: false },
  { text: 'has', italic: false },
  { text: 'every', italic: false },
  { text: 'brand', italic: true },
  { text: 'you', italic: false },
  { text: 'need,', italic: false },
  { text: 'all', italic: false },
  { text: 'in', italic: false },
  { text: 'one', italic: false },
  { text: 'place.', italic: true },
];

export default function ScrollRevealSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const winH = window.innerHeight;
      const startReveal = winH * 0.9;
      const endReveal = winH * 0.2;
      let progress = (startReveal - rect.top) / (startReveal - endReveal);
      progress = Math.max(0, Math.min(1, progress));
      const activeCount = Math.floor(progress * words.length);
      wordRefs.current.forEach((w, i) => {
        if (!w) return;
        if (i < activeCount) w.classList.add('active');
        else w.classList.remove('active');
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-24 bg-card border-y border-border relative z-10"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h2 className="font-display text-2xl sm:text-4xl md:text-5xl leading-tight text-center">
          {words.map((w, i) => (
            <span
              key={i}
              ref={(el) => { wordRefs.current[i] = el; }}
              className={`reveal-word inline-block mr-[0.3em] ${w.italic ? 'italic text-primary' : 'text-foreground'}`}
            >
              {w.text}
            </span>
          ))}
        </h2>
      </div>
    </section>
  );
}