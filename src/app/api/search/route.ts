import { parseSearch, searchPokemon, SearchInputError } from '@/lib/search';
import { artwork } from '@/lib/pokeapi';
export async function GET(request: Request) {
  try {
    const result=await searchPokemon(parseSearch(new URL(request.url).searchParams));
    return Response.json({...result,results:result.results.map(p=>({id:p.id,name:p.dexName,types:p.types.map(t=>t.type.name),image:artwork(p),href:`/pokemon/${p.dexName}`}))},{headers:{'Cache-Control':'public, s-maxage=300, stale-while-revalidate=3600'}});
  } catch(error) {
    const bad=error instanceof SearchInputError;
    return Response.json({error:bad?error.message:'Pokémon data is temporarily unavailable. Please try again.'},{status:bad?400:503,headers:{'Cache-Control':'no-store'}});
  }
}
