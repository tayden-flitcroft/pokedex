import { CatalogPagination } from '@/components/catalog-pagination';
import { RememberExploration } from '@/components/exploration-navigation';
import Link from 'next/link';
import Form from 'next/form';
import { cachedSearchPokemon as searchPokemon } from '@/lib/cached-search';
import { ArrowRight } from 'lucide-react';
import { title, number, artwork } from '@/lib/pokeapi';
import { PokemonImage } from '@/components/pokemon-image';
import { TypeBadge } from '@/components/type-badge';
import { parseSearch, GENERATIONS, SearchInputError } from '@/lib/search';
import { SearchInput } from '@/components/search-input';
import { TYPES } from '@/lib/types';
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = new URLSearchParams();
  Object.entries(await searchParams).forEach(([key, value]) => {
    if (typeof value === 'string') params.set(key, value);
  });
  let options;
  try {
    options = parseSearch(params);
  } catch (error) {
    if (error instanceof SearchInputError)
      return (
        <div className="page">
          <div className="empty">
            <h1>Check those filters.</h1>
            <p>{error.message}</p>
            <Link className="button" href="/">
              Reset filters
            </Link>
          </div>
        </div>
      );
    throw error;
  }
  const {
    results: pokemon,
    total,
    nationalTotal,
    page,
    pages,
  } = await searchPokemon(options);
  const activeFilters = [
    ...(options.q ? [{ key: 'q', label: `Search: ${options.q}` }] : []),
    ...(options.type
      ? [{ key: 'type', label: `Type: ${title(options.type)}` }]
      : []),
    ...(options.generation
      ? [
          {
            key: 'generation',
            label: `Generation ${options.generation} · ${GENERATIONS[options.generation - 1]}`,
          },
        ]
      : []),
  ];
  const removeFilterUrl = (key: string) => {
    const next = new URLSearchParams(params);
    next.delete(key);
    next.delete('page');
    return `/?${next}`;
  };
  const first = total ? (page - 1) * options.limit + 1 : 0;
  const last = total ? first + pokemon.length - 1 : 0;
  const sortLabel =
    options.sort === 'name'
      ? 'name (A–Z)'
      : options.sort === 'number-desc'
        ? 'National number (high to low)'
        : 'National number (low to high)';
  return (
    <div className="page catalog-page">
      <RememberExploration href={params.size ? `/?${params}` : '/'} />
      <section className="intro">
        <div className="catalog-title">
          <div className="eyebrow">
            POKÉMON INDEX / {nationalTotal.toLocaleString()} SPECIES
          </div>
          <h1>
            National <em>Pokédex</em>
          </h1>
          <p>Every Pokémon. Every type. Your next discovery.</p>
        </div>
        <img
          className="intro-ball"
          src="/pokeball.png"
          alt=""
          width={140}
          height={140}
        />
        <Link href="/matchup" className="lab-teaser">
          <span className="eyebrow">BATTLE RESEARCH</span>
          <h2>Type matchups</h2>
          <span>
            Open the type lab <ArrowRight size={18} />
          </span>
        </Link>
      </section>
      <Form
        key={params.toString()}
        className="filters"
        action="/"
        role="search"
      >
        <div className="filter-heading">
          <span className="filter-led" /> SEARCH & FILTER
        </div>
        <div className="search-field">
          <label htmlFor="pokemon-search" className="filter-label">
            Search Pokémon
          </label>
          <SearchInput initial={options.q} />
        </div>
        <label>
          <span className="filter-label">Pokémon type</span>
          <select name="type" defaultValue={options.type}>
            <option value="">All types</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {title(t)}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="filter-label">Generation introduced</span>
          <select name="generation" defaultValue={options.generation || ''}>
            <option value="">All generations</option>
            {GENERATIONS.map((g, i) => (
              <option key={g} value={i + 1}>
                {i + 1} · {g}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="filter-label">Sort results</span>
          <select name="sort" defaultValue={options.sort}>
            <option value="number">Number ↑</option>
            <option value="number-desc">Number ↓</option>
            <option value="name">Name A–Z</option>
          </select>
        </label>
        <button className="button primary" type="submit">
          Apply filters
        </button>
        <Link className="reset-filters" href="/">
          Reset all filters
        </Link>
      </Form>
      <section
        className="catalog-results-summary"
        aria-label="Applied filters and result count"
      >
        <div className="section-heading">
          <h2>
            {activeFilters.length ? 'Filtered Pokémon' : 'All Pokémon'}{' '}
            <span>{total.toLocaleString()}</span>
          </h2>
        </div>
        <p className="results-range">
          {total ? (
            <>
              Showing{' '}
              <strong>
                {first.toLocaleString()}–{last.toLocaleString()}
              </strong>{' '}
              of <strong>{total.toLocaleString()}</strong>{' '}
              {activeFilters.length ? 'matches' : 'Pokémon'}
            </>
          ) : (
            'No Pokémon match these filters.'
          )}
        </p>
        {activeFilters.length ? (
          <>
            <p className="results-explanation">
              Results match all of these applied filters, out of{' '}
              {nationalTotal.toLocaleString()} Pokémon:
            </p>
            <div className="active-filters">
              {activeFilters.map((filter) => (
                <Link
                  key={filter.key}
                  href={removeFilterUrl(filter.key)}
                  aria-label={`Remove ${filter.label}`}
                >
                  {filter.label}
                  <span aria-hidden="true">×</span>
                </Link>
              ))}
              <Link className="clear-all" href="/">
                Clear all
              </Link>
            </div>
          </>
        ) : null}
        <p className="results-pagination">
          {options.limit} per page · Page {page} of {pages} · Sorted by{' '}
          {sortLabel}
        </p>
      </section>
      <div className="pokemon-grid">
        {pokemon.map((p, index) => (
          <Link
            href={`/pokemon/${p.dexName}`}
            className={`pokemon-card card-${p.types[0].type.name}`}
            key={p.id}
          >
            <span className="dex-number">{number(p.id)}</span>
            <PokemonImage
              src={artwork(p)}
              alt={title(p.dexName)}
              priority={index < 4}
            />
            <div className="card-bottom">
              <h3>{title(p.dexName)}</h3>
              <ArrowRight size={18} />
            </div>
            <div className="types">
              {p.types.map((t) => (
                <TypeBadge key={t.type.name} type={t.type.name} />
              ))}
            </div>
          </Link>
        ))}
      </div>
      {!pokemon.length && (
        <div className="empty">
          <h2>No Pokémon in sight.</h2>
          <p>Try another name, number, or combination of filters.</p>
          <Link href="/" className="button">
            Clear filters
          </Link>
        </div>
      )}
      <CatalogPagination page={page} pages={pages} query={params.toString()} />
    </div>
  );
}
