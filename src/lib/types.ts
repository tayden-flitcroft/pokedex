export const TYPES = ['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy'] as const;
export type PokemonType = typeof TYPES[number];
export function isType(value: string): value is PokemonType { return (TYPES as readonly string[]).includes(value); }
