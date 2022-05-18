import { cache } from 'react';

export type Named = { name: string; url: string };
export type Pokemon = {
  id: number; name: string; height: number; weight: number; base_experience: number;
  types: { slot: number; type: Named }[];
  abilities: { is_hidden: boolean; ability: Named }[];
  stats: { base_stat: number; stat: Named }[];
  species: Named;
  sprites: { front_default: string | null; front_shiny: string | null; other: { 'official-artwork': { front_default: string | null; front_shiny: string | null } } };
};
export type Species = {
  name: string; genera: { genus: string; language: Named }[];
  flavor_text_entries: { flavor_text: string; language: Named }[];
  generation: Named; habitat: Named | null; capture_rate: number;
  is_legendary: boolean; is_mythical: boolean;
  varieties: { is_default: boolean; pokemon: Named }[];
  evolution_chain: { url: string } | null;
};
export type DexEntry = { id: number; name: string };
export class UpstreamError extends Error {}
export class MissingPokemonError extends Error {}

export async function pokeFetch<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`https://pokeapi.co/api/v2/${path}`, {
      next: { revalidate: 86400 }, signal: AbortSignal.timeout(10000),
    });
  } catch { throw new UpstreamError('PokéAPI is taking a little too long to respond. Please try again.'); }
  if (response.status === 404) throw new MissingPokemonError('Pokémon not found');
  if (!response.ok) throw new UpstreamError('PokéAPI is temporarily unavailable. Please try again.');
  return response.json() as Promise<T>;
}
export const getDex = cache(async (): Promise<DexEntry[]> => {
  const dex = await pokeFetch<{ pokemon_entries: { entry_number: number; pokemon_species: Named }[] }>('pokedex/national');
  return dex.pokemon_entries.map(p => ({ id: p.entry_number, name: p.pokemon_species.name })).sort((a,b) => a.id-b.id);
});
export const getPokemon = cache((name: string) => pokeFetch<Pokemon>(`pokemon/${encodeURIComponent(name)}`));
export const getSpecies = cache((name: string) => pokeFetch<Species>(`pokemon-species/${encodeURIComponent(name)}`));
export const getDefaultPokemon = cache(async (entry: DexEntry) => {
  // Species names and default variety names differ (for example, deoxys-normal).
  try { return await getPokemon(String(entry.id)); }
  catch (error) {
    if (!(error instanceof MissingPokemonError)) throw error;
    const species = await getSpecies(entry.name);
    return getPokemon(species.varieties.find(v => v.is_default)!.pokemon.name);
  }
});
export function title(value: string) { return value.replaceAll('-', ' ').replace(/\b\w/g, c => c.toUpperCase()); }
export function number(id: number) { return `#${String(id).padStart(4, '0')}`; }
export function artwork(p: Pokemon, shiny = false) {
  return (shiny ? p.sprites.other['official-artwork'].front_shiny : p.sprites.other['official-artwork'].front_default)
    || (shiny ? p.sprites.front_shiny : p.sprites.front_default) || '/image-not-found.png';
}
