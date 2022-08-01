'use client';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { PokemonImage } from './pokemon-image';
export function ProfileArt({
  normal,
  shiny,
  name,
}: {
  normal: string;
  shiny: string | null;
  name: string;
}) {
  const [isShiny, setShiny] = useState(false);
  return (
    <div className="profile-art">
      <PokemonImage
        key={isShiny ? 'shiny' : 'normal'}
        src={isShiny && shiny ? shiny : normal}
        alt={`${isShiny ? 'Shiny ' : ''}${name}`}
        priority
      />
      <button
        className="button"
        disabled={!shiny}
        aria-pressed={isShiny}
        onClick={() => setShiny(!isShiny)}
      >
        <Sparkles size={16} />
        {!shiny
          ? 'Shiny unavailable'
          : isShiny
            ? 'Shiny appearance'
            : 'Show shiny'}
      </button>
    </div>
  );
}
