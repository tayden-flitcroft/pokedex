import type { Metadata } from 'next';
import Link from 'next/link';
import localFont from 'next/font/local';
import { BookOpen, ArrowUpRight, Swords, Smartphone } from 'lucide-react';
import './globals.css';
import './pokedex-theme.css';
const pokemonFont = localFont({
  src: './fonts/Pokemon_Solid.ttf',
  variable: '--font-pokemon',
  display: 'swap',
});
export const metadata: Metadata = {
  title: {
    default: 'Pokédex — A Pokémon field guide',
    template: '%s | Pokédex',
  },
  description:
    'Explore the National Pokédex, discover every Pokémon, and study your next type matchup.',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={pokemonFont.variable}>
        <noscript>
          <style>{`.pokemon-artwork[data-loaded='false']{visibility:visible}.artwork-loading{display:none}`}</style>
        </noscript>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <header className="site-header">
          <div className="header-inner">
            <Link href="/" className="brand">
              <img
                className="brand-ball"
                src="/pokeball.png"
                alt=""
                width={44}
                height={44}
              />
              <span className="pokemon-wordmark">Pokédex</span>
              <span className="edition">NATIONAL DATABASE</span>
            </Link>
            <nav aria-label="Main navigation">
              <Link href="/">
                <BookOpen size={17} /> Explore
              </Link>
              <Link href="/matchup">
                <Swords size={17} /> Type lab
              </Link>
              <Link href="/pokemon-go">
                <Smartphone size={17} /> Pokémon GO
              </Link>
            </nav>
            <a
              className="source-link"
              href="https://pokeapi.co"
              target="_blank"
              rel="noreferrer"
            >
              Powered by PokéAPI <ArrowUpRight size={14} />
            </a>
          </div>
        </header>
        <main id="main">{children}</main>
        <footer>
          <span>
            <strong>pokédex</strong> / An independent field guide
          </span>
          <span>© 2026 Tayden</span>
        </footer>
      </body>
    </html>
  );
}
