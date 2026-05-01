'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface Props {
  images: string[];
  intervalMs?: number;
  alt: string;
}

export default function HeroBackgroundClient({ images, intervalMs = 3000, alt }: Props) {
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState<Set<number>>(() => {
    const initial = new Set<number>([0]);
    if (images.length > 1) initial.add(1);
    return initial;
  });

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => {
      setIndex(i => (i + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(t);
  }, [images.length, intervalMs]);

  useEffect(() => {
    const nextIdx = (index + 1) % images.length;
    setMounted(prev => {
      if (prev.has(index) && prev.has(nextIdx)) return prev;
      const updated = new Set(prev);
      updated.add(index);
      updated.add(nextIdx);
      return updated;
    });
  }, [index, images.length]);

  return (
    <>
      {images.map((src, i) =>
        mounted.has(i) ? (
          <Image
            key={src}
            src={src}
            alt={alt}
            fill
            priority={i === 0}
            sizes="100vw"
            className={`hero-fallback hero-slide${i === index ? ' active' : ''}`}
            style={{ objectFit: 'cover', objectPosition: 'center top' }}
          />
        ) : null,
      )}
    </>
  );
}
