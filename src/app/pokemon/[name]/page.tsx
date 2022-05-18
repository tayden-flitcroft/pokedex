import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getDex, getDefaultPokemon, getSpecies, pokeFetch, artwork, title, number, type Named } from '@/lib/pokeapi';
import { TypeBadge } from '@/components/type-badge';
import { ProfileArt } from '@/components/profile-art';
export const dynamic='force-dynamic';
type Props={params:Promise<{name:string}>};
async function resolve(name:string) {
  const dex=await getDex();
  const entry=dex.find(p=>p.name===name.toLowerCase()||String(p.id)===name);
  if(!entry)notFound();
  return {entry,dex};
}
export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {entry}=await resolve((await params).name);
  return {title:`${title(entry.name)} ${number(entry.id)}`,description:`Explore ${title(entry.name)}: base stats, abilities, evolution family, and type matchups.`};
}
type Chain={species:Named;evolves_to:Chain[]};
function flatten(chain:Chain,depth=0):{name:string;depth:number}[]{return [{name:chain.species.name,depth},...chain.evolves_to.flatMap(c=>flatten(c,depth+1))];}
export default async function Profile({params}:Props){
  const {name}=await params;
  const {entry,dex}=await resolve(name);
  if(name!==entry.name)permanentRedirect(`/pokemon/${entry.name}`);
  const [p,species]=await Promise.all([getDefaultPokemon(entry),getSpecies(entry.name)]);
  let evolution:{name:string;depth:number}[]=[];
  let evolutionUnavailable=false;
  if(species.evolution_chain){
    try {const id=species.evolution_chain.url.split('/').filter(Boolean).at(-1);evolution=flatten((await pokeFetch<{chain:Chain}>(`evolution-chain/${id}`)).chain);}
    catch {evolutionUnavailable=true;}
  }
  const description=species.flavor_text_entries.find(e=>e.language.name==='en')?.flavor_text.replace(/[\n\f\r]/g,' ')||'A Pokémon waiting to be discovered.';
  const genus=species.genera.find(e=>e.language.name==='en')?.genus||'Pokémon';
  const index=dex.findIndex(e=>e.id===entry.id),previous=dex[index-1],next=dex[index+1];
  const typeQuery=new URLSearchParams({defender:p.types[0].type.name,...(p.types[1]?{secondary:p.types[1].type.name}:{})});
  return <div className="page"><Link className="back-link" href="/"><ArrowLeft size={16}/> Back to exploration</Link><div className={`profile-hero card-${p.types[0].type.name}`}><ProfileArt normal={artwork(p)} shiny={p.sprites.other['official-artwork'].front_shiny||p.sprites.front_shiny} name={title(entry.name)}/><section className="profile-summary"><div className="eyebrow">{number(entry.id)} <span> / </span> {genus}</div><h1>{title(entry.name)}</h1><div className="types">{p.types.map(t=><TypeBadge key={t.type.name} type={t.type.name}/>)}</div><p className="flavor">{description}</p><dl className="facts"><div><dt>Height</dt><dd>{p.height/10} m</dd></div><div><dt>Weight</dt><dd>{p.weight/10} kg</dd></div><div><dt>Generation</dt><dd>{species.generation.name.replace('generation-','').toUpperCase()}</dd></div><div><dt>Habitat</dt><dd>{species.habitat?title(species.habitat.name):'Unknown'}</dd></div></dl>{(species.is_legendary||species.is_mythical)&&<p className="rarity">{species.is_mythical?'Mythical Pokémon':'Legendary Pokémon'}</p>}</section></div><div className="profile-details"><section className="panel"><div className="section-heading"><h2>Base stats</h2><span>Total · {p.stats.reduce((sum,s)=>sum+s.base_stat,0)}</span></div><div className="stats">{p.stats.map(s=><div className="stat" key={s.stat.name}><span>{title(s.stat.name).replace('Special','Sp.')}</span><strong>{s.base_stat}</strong><div className="stat-track" role="meter" aria-label={title(s.stat.name)} aria-valuenow={s.base_stat} aria-valuemin={0} aria-valuemax={255}><span style={{width:`${s.base_stat/255*100}%`}}/></div></div>)}</div><p className="panel-note">Species base values, before level, nature, IVs, or EVs.</p></section><section className="panel"><div className="section-heading"><h2>Abilities & typing</h2></div><div className="abilities">{p.abilities.map(a=><div key={a.ability.name}><strong>{title(a.ability.name)}</strong><span>{a.is_hidden?'Hidden ability':'Standard ability'}</span></div>)}</div><Link className="matchup-link" href={`/matchup?${typeQuery}`}>Analyze {title(entry.name)}’s type defenses <ArrowRight size={18}/></Link></section></div><section className="panel evolution"><div className="section-heading"><h2>Evolution family</h2><span>Follow the species connections</span></div>{evolutionUnavailable?<p>Evolution data is temporarily unavailable. Reload to try again.</p>:<div className="evolution-list">{evolution.map(e=><Link className={e.name===entry.name?'current':''} href={`/pokemon/${e.name}`} key={e.name}><span className="eyebrow">{e.depth===0?'BASE FORM':`STAGE ${e.depth+1}`}</span><strong>{title(e.name)}</strong><ArrowRight size={17}/></Link>)}</div>}</section><nav className="profile-pagination" aria-label="Adjacent Pokémon">{previous?<Link href={`/pokemon/${previous.name}`}><ArrowLeft size={18}/><span><small>{number(previous.id)}</small>{title(previous.name)}</span></Link>:<span/>}{next?<Link href={`/pokemon/${next.name}`}><span><small>{number(next.id)}</small>{title(next.name)}</span><ArrowRight size={18}/></Link>:<span/>}</nav></div>;
}
