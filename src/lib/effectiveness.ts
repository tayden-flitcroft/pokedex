import { TYPES, type PokemonType } from './types';
export type TypeChart = Record<PokemonType, Record<PokemonType, number>>;
export function effectiveness(chart:TypeChart,attack:PokemonType,defenders:PokemonType[]) {
  return [...new Set(defenders)].reduce((multiplier,type)=>multiplier*chart[attack][type],1);
}
export function defenses(chart:TypeChart,defenders:PokemonType[]) {
  return TYPES.map(type=>({type,multiplier:effectiveness(chart,type,defenders)}));
}
export function effectivenessLabel(value:number) {return value===0?'No effect':value<1?'Not very effective':value>1?'Super effective':'Normally effective';}
