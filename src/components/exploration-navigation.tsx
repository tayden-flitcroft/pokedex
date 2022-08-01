'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

const locationKey = 'pokedex:exploration';
const restoreKey = 'pokedex:restore-exploration';

function readLocation(): { href: string; scrollY: number } | null {
  try {
    const saved = JSON.parse(sessionStorage.getItem(locationKey) || 'null');
    if (
      saved &&
      typeof saved.href === 'string' &&
      (saved.href === '/' || saved.href.startsWith('/?')) &&
      Number.isFinite(saved.scrollY) &&
      saved.scrollY >= 0
    )
      return saved;
  } catch {}
  return null;
}

// Keep this tab's catalog position without adding query strings to cached profiles.
export function RememberExploration({ href }: { href: string }) {
  useEffect(() => {
    let frame = 0;
    const saved = readLocation();
    try {
      if (sessionStorage.getItem(restoreKey) === href && saved?.href === href) {
        sessionStorage.removeItem(restoreKey);
        frame = requestAnimationFrame(() => window.scrollTo(0, saved.scrollY));
      }
    } catch {}
    const remember = () => {
      try {
        sessionStorage.setItem(
          locationKey,
          JSON.stringify({ href, scrollY: window.scrollY }),
        );
      } catch {}
    };
    // Capture the position before a link starts navigation or resets scrolling.
    document.addEventListener('click', remember, true);
    window.addEventListener('pagehide', remember);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('click', remember, true);
      window.removeEventListener('pagehide', remember);
    };
  }, [href]);
  return null;
}

export function BackToExploration() {
  const [href, setHref] = useState('/');
  useEffect(() => {
    setHref(readLocation()?.href || '/');
  }, []);
  return (
    <Link
      className="back-link"
      href={href}
      scroll={false}
      onClick={() => {
        try {
          sessionStorage.setItem(restoreKey, href);
        } catch {}
      }}
    >
      <ArrowLeft size={16} /> Back to exploration
    </Link>
  );
}
