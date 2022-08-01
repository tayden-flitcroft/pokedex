'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="page">
      <div className="empty">
        <h2>A little interference.</h2>
        <p>We couldn’t reach the Pokémon data. Please try again in a moment.</p>
        <button className="button primary" onClick={reset}>
          Try again
        </button>
      </div>
    </div>
  );
}
