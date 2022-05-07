import Link from 'next/link';
export default function NotFound() { return <div className="page"><div className="empty"><h1>Off the map.</h1><p>That Pokémon or page couldn’t be found.</p><Link className="button primary" href="/">Back to the Pokédex</Link></div></div>; }
