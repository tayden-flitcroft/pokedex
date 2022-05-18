'use client';
import { useState } from 'react';
export function PokemonImage({ src, alt, className = '', priority = false }: { src: string; alt: string; className?: string; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <img className={className} src={failed ? '/image-not-found.png' : src} alt={alt} width={300} height={300} loading={priority ? 'eager' : 'lazy'} onError={() => setFailed(true)} />;
}
