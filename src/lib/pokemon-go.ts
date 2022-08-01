import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { buildGoSpecies, type GoDatasets } from './pokemon-go-model';

async function fetchGo<T>(file: string): Promise<T> {
  const response = await fetch(`https://pogoapi.net/api/v1/${file}.json`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok)
    throw new Error(`GO data request failed (${response.status})`);
  return response.json() as Promise<T>;
}
export async function fetchGoData() {
  const files = [
    'pokemon_stats',
    'current_pokemon_moves',
    'pokemon_buddy_distances',
    'pokemon_candy_to_evolve',
    'pokemon_types',
    'released_pokemon',
    'shiny_pokemon',
  ];
  const results = await Promise.allSettled(
    files.map((file) => fetchGo<unknown>(file)),
  );
  const values = results.map((result) =>
    result.status === 'fulfilled' ? result.value : null,
  );
  if (!Array.isArray(values[0]) || !values[0].length)
    throw new Error('GO stats are unavailable');
  const array = (i: number) => (Array.isArray(values[i]) ? values[i] : null);
  const object = (i: number) =>
    values[i] && typeof values[i] === 'object' && !Array.isArray(values[i])
      ? values[i]
      : null;
  const datasets = {
    stats: values[0],
    moves: array(1),
    buddies: object(2),
    candy: object(3),
    types: array(4),
    released: object(5),
    shiny: object(6),
  } as GoDatasets;
  return {
    species: buildGoSpecies(datasets),
    retrievedAt: new Date().toISOString(),
    partial: values.some((v) => v === null),
  };
}
const loadGoData = unstable_cache(fetchGoData, ['pokemon-go-data-v1'], {
  revalidate: 21600,
});
export const getGoData = cache(loadGoData);
