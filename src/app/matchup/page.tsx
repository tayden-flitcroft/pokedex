import type { Metadata } from 'next';
import { getTypeChart } from '@/lib/type-chart';
import { TypeLab } from '@/components/type-lab';
import { isType } from '@/lib/types';
export const metadata:Metadata={title:'Type lab',description:'Calculate Pokémon type effectiveness, dual-type weaknesses, resistances, immunities, and STAB.'};
export const dynamic='force-dynamic';
export default async function Matchup({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
  const params=await searchParams;
  const get=(key:string,fallback:string)=>typeof params[key]==='string'&&isType(params[key])?params[key]:fallback;
  return <TypeLab chart={await getTypeChart()} initial={{attack:get('attack','fire'),defender:get('defender','grass'),secondary:get('secondary',''),stab:params.stab==='1'}}/>;
}
