import { unstable_cache } from 'next/cache';
import { normalizeSearch, searchPokemon, type SearchOptions } from './search';

// Next's disposable data cache is shared by SSR and the public search API.
// All inputs are explicit and normalized; different filters never share results.
const cachedSearch = unstable_cache(
  (options: SearchOptions) => searchPokemon(options),
  ['national-dex-search-v1'],
  { revalidate: 3600 },
);
export function cachedSearchPokemon(options: SearchOptions) {
  return cachedSearch({
    q: normalizeSearch(options.q),
    type: options.type,
    generation: options.generation,
    sort: options.sort,
    page: options.page,
    limit: options.limit,
  });
}
