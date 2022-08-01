import type { Metadata } from 'next';
import Link from 'next/link';
import Form from 'next/form';
import { getGoData } from '@/lib/pokemon-go';
import { getDex, number, title } from '@/lib/pokeapi';
import { normalizeSearch } from '@/lib/search';
import { TypeBadge } from '@/components/type-badge';
export const metadata: Metadata = {
  title: 'Pokémon GO guide',
  description:
    'Browse Pokémon GO base stats, forms, moves, buddy distances, and evolution candy requirements.',
};
export default async function GoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q.trim().slice(0, 80) : '';
  const sort =
    params.sort === 'attack' ||
    params.sort === 'defense' ||
    params.sort === 'stamina'
      ? params.sort
      : 'number';
  const released = params.released === '1';
  const rawPage =
    typeof params.page === 'string' && /^\d+$/.test(params.page)
      ? Math.min(10000, Number(params.page))
      : 1;
  let data;
  try {
    data = await getGoData();
  } catch {
    return (
      <div className="page">
        <div className="empty">
          <h1>Pokémon GO</h1>
          <p>
            The GO data source is temporarily unavailable. Please try again
            shortly.
          </p>
          <Link className="button" href="/pokemon-go">
            Try again
          </Link>{' '}
          <Link className="button" href="/">
            Main Pokédex
          </Link>
        </div>
      </div>
    );
  }
  // The GO guide remains usable if the separate main-series API is unavailable.
  const dex = await getDex().catch(() => []);
  const dexNames = new Map(dex.map((p) => [p.id, p.name]));
  const query = normalizeSearch(q);
  const matches = data.species.filter(
    (p) =>
      (!query ||
        normalizeSearch(p.name).includes(query) ||
        String(p.id) === String(Number(query))) &&
      (!released || p.released === true),
  );
  matches.sort((a, b) =>
    sort === 'number'
      ? a.id - b.id
      : b.forms[0][sort] - a.forms[0][sort] || a.id - b.id,
  );
  const pages = Math.max(1, Math.ceil(matches.length / 24));
  const page = Math.max(1, Math.min(rawPage, pages));
  const rows = matches.slice((page - 1) * 24, page * 24);
  const pageUrl = (n: number) =>
    `/pokemon-go?${new URLSearchParams({ q, sort, ...(released ? { released: '1' } : {}), page: String(n) })}`;
  return (
    <div className="page go-page">
      <section className="go-intro">
        <div>
          <div className="eyebrow">THE MOBILE FIELD GUIDE</div>
          <h1>
            Pokémon <em>GO</em>
          </h1>
          <p>
            Compare GO stats, then open a Pokémon’s sheet for its forms, moves,
            and evolution costs.
          </p>
        </div>
        <img src="/pokeball.png" alt="" width={110} height={110} />
      </section>
      <Form
        action="/pokemon-go"
        className="go-filters"
        key={`${q}:${sort}:${released}`}
      >
        <label>
          Search Pokémon
          <input
            name="q"
            defaultValue={q}
            maxLength={80}
            placeholder="Name or National number"
            type="search"
          />
        </label>
        <label>
          Sort by
          <select name="sort" defaultValue={sort}>
            <option value="number">National number</option>
            <option value="attack">Highest base Attack</option>
            <option value="defense">Highest base Defense</option>
            <option value="stamina">Highest base Stamina</option>
          </select>
        </label>
        <label className="go-check">
          <input
            type="checkbox"
            name="released"
            value="1"
            defaultChecked={released}
          />
          Only recorded releases
        </label>
        <button className="button primary" type="submit">
          Apply
        </button>
        <Link href="/pokemon-go" className="go-inline-link">
          Reset
        </Link>
      </Form>
      <div className="section-heading">
        <h2>{matches.length.toLocaleString()} species</h2>
        <span>
          Page {page} of {pages} · Up to 24 per page
        </span>
      </div>
      <p className="go-note">
        {released
          ? 'Showing species with a release record.'
          : 'Showing all species with GO stats, including those without a confirmed release record.'}{' '}
        Stats use the Normal form where listed; otherwise, the displayed form.
        Shiny and release records apply to the species, not every form.
      </p>
      {data.partial && (
        <p className="go-note">
          Some supplemental data is temporarily unavailable; missing values are
          not treated as confirmed absence.
        </p>
      )}
      {rows.length ? (
        <div className="go-table-wrap">
          <table className="go-table">
            <caption className="sr-only">
              Pokémon GO base stats for the displayed form
            </caption>
            <thead>
              <tr>
                <th scope="col">Pokémon / GO form</th>
                <th scope="col">Types</th>
                <th scope="col">Attack</th>
                <th scope="col">Defense</th>
                <th scope="col">Stamina</th>
                <th scope="col">Release record</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <th scope="row">
                    <Link
                      href={`/pokemon/${dexNames.get(p.id) || p.id}#pokemon-go`}
                    >
                      <small>{number(p.id)}</small>
                      {title(p.name)}
                      <span className="go-table-form">
                        {p.forms[0].form.replaceAll('_', ' ')} ·{' '}
                        {p.forms.length}{' '}
                        {p.forms.length === 1 ? 'form' : 'forms'}
                      </span>
                    </Link>
                  </th>
                  <td>
                    <div className="types">
                      {p.forms[0].types.map((t) => (
                        <TypeBadge key={t} type={t} />
                      ))}
                    </div>
                  </td>
                  <td>{p.forms[0].attack}</td>
                  <td>{p.forms[0].defense}</td>
                  <td>{p.forms[0].stamina}</td>
                  <td>{p.released ? 'Recorded' : 'Unconfirmed'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">
          <h2>No GO records match.</h2>
          <Link className="button" href="/pokemon-go">
            Clear filters
          </Link>
        </div>
      )}
      <nav className="pagination" aria-label="GO result pages">
        {page > 1 ? (
          <Link className="button" href={pageUrl(page - 1)}>
            ← Previous
          </Link>
        ) : (
          <span />
        )}
        <span>
          Page {page} of {pages}
        </span>
        {page < pages ? (
          <Link className="button" href={pageUrl(page + 1)}>
            Next →
          </Link>
        ) : (
          <span />
        )}
      </nav>
      <p className="go-source">
        Community-maintained data from{' '}
        <a href="https://pogoapi.net/documentation/">PoGoAPI</a> · Retrieved{' '}
        {data.retrievedAt.slice(0, 10)} (UTC). Records may lag the live game;
        this is not a live spawn or raid tracker.
      </p>
    </div>
  );
}
