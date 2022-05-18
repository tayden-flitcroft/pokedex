import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, ArrowUpRight, Swords } from 'lucide-react';
import './globals.css';
export const metadata: Metadata = { title: { default: 'Pokédex — A Pokémon field guide', template: '%s | Pokédex' }, description: 'Explore the National Pokédex, discover every Pokémon, and study your next type matchup.' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><a href="#main" className="skip-link">Skip to content</a><header className="site-header"><div className="header-inner"><Link href="/" className="brand"><span className="brand-mark">P<span>•</span></span>pokédex<span className="edition">FIELD GUIDE</span></Link><nav aria-label="Main navigation"><Link href="/"><BookOpen size={17}/> Explore</Link><Link href="/matchup"><Swords size={17}/> Type lab</Link></nav><a className="source-link" href="https://pokeapi.co" target="_blank" rel="noreferrer">Powered by PokéAPI <ArrowUpRight size={14}/></a></div></header><main id="main">{children}</main><footer><span><strong>pokédex</strong> / An independent field guide</span><span>Data from <a href="https://pokeapi.co">PokéAPI</a>. Pokémon © Nintendo, Creatures & GAME FREAK.</span></footer></body></html>;
}
