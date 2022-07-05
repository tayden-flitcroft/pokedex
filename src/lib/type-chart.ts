import { cache } from 'react';
import { pokeFetch, type Named } from './pokeapi';
import { TYPES } from './types';
import type { TypeChart } from './effectiveness';
export const getTypeChart=cache(async():Promise<TypeChart>=>{
  const rows=await Promise.all(TYPES.map(async type=>{
    const data=await pokeFetch<{damage_relations:{double_damage_to:Named[];half_damage_to:Named[];no_damage_to:Named[]}}>(`type/${type}`);
    const relations=data.damage_relations;
    return [type,Object.fromEntries(TYPES.map(defender=>[defender,relations.no_damage_to.some(t=>t.name===defender)?0:relations.double_damage_to.some(t=>t.name===defender)?2:relations.half_damage_to.some(t=>t.name===defender)?.5:1]))];
  }));
  return Object.fromEntries(rows) as TypeChart;
});
