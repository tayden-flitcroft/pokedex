'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
export function SearchInput({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<
    { id: number; name: string; href: string }[]
  >([]);
  const [state, setState] = useState('');
  useEffect(() => setValue(initial), [initial]);
  useEffect(() => {
    setResults([]);
    setState('');
    if (value.trim().length < 2 || !focused) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setState('Searching…');
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(value.trim())}&limit=6`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (controller.signal.aborted) return;
        setResults(data.results);
        setState(data.results.length ? '' : 'No matching Pokémon.');
      } catch {
        if (!controller.signal.aborted)
          setState('Suggestions unavailable. Try submitting your search.');
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value, focused]);
  return (
    <div
      className="search-wrap"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
    >
      <Search size={19} />
      <input
        id="pokemon-search"
        aria-label="Search Pokémon by name or number"
        name="q"
        type="search"
        maxLength={80}
        autoComplete="off"
        placeholder="Name or number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setFocused(false);
        }}
      />
      {focused && value.trim().length >= 2 && (results.length > 0 || state) && (
        <div className="suggestions">
          <p className="suggestion-heading">Quick links · all Pokémon</p>
          <span className="sr-only" role="status">
            {state || `${results.length} suggestions. Tab to choose a Pokémon.`}
          </span>
          {results.map((p) => (
            <Link key={p.id} href={p.href} onClick={() => setFocused(false)}>
              <span>{p.name.replaceAll('-', ' ')}</span>
              <small>#{String(p.id).padStart(4, '0')}</small>
            </Link>
          ))}
          {state && <p>{state}</p>}
        </div>
      )}
    </div>
  );
}
