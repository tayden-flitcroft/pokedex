import Link from 'next/link';
import { getGoData } from '@/lib/pokemon-go';
import { PokemonGoDetails } from './pokemon-go-details';
export async function PokemonGoSection({ id }: { id: number }) {
  let data;
  try {
    data = await getGoData();
  } catch {
    return (
      <section id="pokemon-go" className="panel go-section">
        <h2>Pokémon GO</h2>
        <p className="go-note">
          Pokémon GO data is temporarily unavailable. The rest of this profile
          is still available.
        </p>
        <Link className="go-inline-link" href="/pokemon-go">
          Visit the GO guide →
        </Link>
      </section>
    );
  }
  const species = data.species.find((p) => p.id === id);
  return (
    <section id="pokemon-go" className="panel go-section">
      <div className="section-heading">
        <h2>
          Pokémon <span className="go-word">GO</span>
        </h2>
        <Link className="go-inline-link" href="/pokemon-go">
          Explore the GO guide →
        </Link>
      </div>
      {species ? (
        <PokemonGoDetails key={id} species={species} />
      ) : (
        <p className="go-note">
          No Pokémon GO stats are listed for this species in our data source
          yet. This does not confirm its release status.
        </p>
      )}
      {data.partial && (
        <p className="go-note">Some supplemental data could not be loaded.</p>
      )}
    </section>
  );
}
