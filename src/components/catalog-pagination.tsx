import Link from 'next/link';
import Form from 'next/form';

export function CatalogPagination({
  page,
  pages,
  query,
}: {
  page: number;
  pages: number;
  query: string;
}) {
  if (pages <= 1) return null;
  const params = new URLSearchParams(query);
  const href = (number: number) => {
    const next = new URLSearchParams(params);
    next.set('page', String(number));
    return `/?${next}`;
  };
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  const end = Math.min(pages, start + 4);
  const numbers = Array.from(
    new Set([
      1,
      ...Array.from({ length: end - start + 1 }, (_, i) => start + i),
      pages,
    ]),
  ).sort((a, b) => a - b);
  return (
    <nav
      className="pagination catalog-pagination"
      aria-label="Pokémon results pages"
    >
      <div className="pagination-links">
        {page > 1 ? (
          <Link className="button" href={href(page - 1)} rel="prev">
            ← Previous
          </Link>
        ) : (
          <span className="button" aria-disabled="true">
            ← Previous
          </span>
        )}
        <div className="pagination-numbers">
          {numbers.map((number, index) => (
            <span className="pagination-item" key={number}>
              {index > 0 && number - numbers[index - 1] > 1 && (
                <span className="pagination-gap" aria-hidden="true">
                  …
                </span>
              )}
              <Link
                className="button page-number"
                href={href(number)}
                aria-current={number === page ? 'page' : undefined}
                aria-label={`${number === 1 ? 'First page, ' : number === pages ? 'Last page, ' : ''}Page ${number}`}
              >
                {number}
              </Link>
            </span>
          ))}
        </div>
        {page < pages ? (
          <Link className="button" href={href(page + 1)} rel="next">
            Next →
          </Link>
        ) : (
          <span className="button" aria-disabled="true">
            Next →
          </span>
        )}
      </div>
      <Form action="/" className="pagination-jump" key={query}>
        {Array.from(params.entries())
          .filter(([key]) => key !== 'page')
          .map(([key, value]) => (
            <input type="hidden" name={key} value={value} key={key} />
          ))}
        <span>
          Page {page} of {pages}
        </span>
        <label htmlFor="jump-page">Go to page</label>
        <input
          id="jump-page"
          name="page"
          type="number"
          min={1}
          max={pages}
          defaultValue={page}
          required
        />
        <button className="button" type="submit">
          Go
        </button>
      </Form>
    </nav>
  );
}
