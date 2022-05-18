import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getDex, getDefaultPokemon, title, number, artwork } from '@/lib/pokeapi';
import { PokemonImage } from '@/components/pokemon-image';
import { TypeBadge } from '@/components/type-badge';
export const dynamic = 'force-dynamic';
export default async function Home() {
  const dex = await getDex();
  const pokemon = await Promise.all(dex.slice(0, 24).map(getDefaultPokemon));
  return <div className="page"><section className="intro"><div><div className="eyebrow"><span className="status-dot"/> THE NATIONAL POKÉDEX</div><h1>A world worth<br/><em>discovering.</em></h1><p>Get to know every Pokémon. Find your favorites.<br/>Discover what makes them extraordinary.</p></div><Link href="/matchup" className="lab-teaser"><span className="eyebrow">THE TYPE LAB</span><h2>Know your<br/>next matchup.</h2><span>Explore type advantages <ArrowRight size={18}/></span></Link></section><div className="section-heading"><h2>Explore Pokémon <span>{dex.length.toLocaleString()}</span></h2><span>National number ↑</span></div><div className="pokemon-grid">{pokemon.map(p => <Link href={`/pokemon/${p.species.name}`} className={`pokemon-card card-${p.types[0].type.name}`} key={p.id}><span className="dex-number">{number(p.id)}</span><PokemonImage src={artwork(p)} alt={title(p.name)}/><div className="card-bottom"><h3>{title(p.name)}</h3><ArrowRight size={18}/></div><div className="types">{p.types.map(t => <TypeBadge key={t.type.name} type={t.type.name}/>)}</div></Link>)}</div></div>;
}
