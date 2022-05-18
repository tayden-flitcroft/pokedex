import { getDex, getDefaultPokemon, pokeFetch, type Named, type DexEntry } from './pokeapi';
import { isType } from './types';
export const GENERATIONS = ['Kanto','Johto','Hoenn','Sinnoh','Unova','Kalos','Alola','Galar & Hisui','Paldea'];
const RANGES = [[1,151],[152,251],[252,386],[387,493],[494,649],[650,721],[722,809],[810,905],[906,Infinity]];
export type SearchOptions = { q: string; type: string; generation: number; sort: string; page: number; limit: number };
export class SearchInputError extends Error {}
export function parseSearch(params: URLSearchParams): SearchOptions {
  const q=(params.get('q') || '').trim();
  const type=params.get('type') || '';
  const generation=params.get('generation') || '';
  const sort=params.get('sort') || 'number';
  const page=params.get('page') || '1';
  const limit=params.get('limit') || '24';
  if(q.length>80 || (type && !isType(type)) || (generation && !/^[1-9]$/.test(generation)) || !['number','name','number-desc'].includes(sort) || !/^\d+$/.test(page) || Number(page)<1 || Number(page)>10000 || !/^\d+$/.test(limit) || Number(limit)<1 || Number(limit)>48) throw new SearchInputError('Use a valid type, generation (1–9), sort, page (1–10000), and limit (1–48). Search is limited to 80 characters.');
  return { q, type, generation:Number(generation), sort, page:Number(page),limit:Number(limit) };
}
export function normalizeSearch(value: string) { return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/♀/g,'f').replace(/♂/g,'m').replace(/[^a-z0-9]/g,''); }
export function filterEntries(entries: DexEntry[], options: SearchOptions, typeIds?: Set<number>) {
  const q=normalizeSearch(options.q);
  const range=RANGES[options.generation-1];
  return entries.filter(e => (!q || normalizeSearch(e.name).includes(q) || (/^\d+$/.test(q) && e.id===Number(q))) && (!range || (e.id>=range[0]&&e.id<=range[1])) && (!typeIds || typeIds.has(e.id))).sort((a,b)=>options.sort==='name'?a.name.localeCompare(b.name):options.sort==='number-desc'?b.id-a.id:a.id-b.id);
}
export async function searchPokemon(options: SearchOptions) {
  const [dex, type] = await Promise.all([getDex(), options.type ? pokeFetch<{pokemon:{pokemon:Named}[]}>(`type/${options.type}`):null]);
  const ids=type?new Set(type.pokemon.map(p=>Number(p.pokemon.url.split('/').filter(Boolean).at(-1)))):undefined;
  const matches=filterEntries(dex,options,ids);
  const pages=Math.max(1,Math.ceil(matches.length/options.limit));
  const page=Math.min(options.page,pages);
  const results=await Promise.all(matches.slice((page-1)*options.limit,page*options.limit).map(async entry=>({ ...(await getDefaultPokemon(entry)), dexName: entry.name })));
  return {results,total:matches.length,nationalTotal:dex.length,page,pages,limit:options.limit};
}
