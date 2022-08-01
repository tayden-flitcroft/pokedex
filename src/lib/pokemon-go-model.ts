export type GoIdentity = {
  pokemon_id: number;
  pokemon_name: string;
  form?: string;
};
export type GoStats = GoIdentity & {
  base_attack: number;
  base_defense: number;
  base_stamina: number;
};
export type GoMoves = GoIdentity & {
  fast_moves: string[];
  charged_moves: string[];
  elite_fast_moves: string[];
  elite_charged_moves: string[];
};
export type GoDatasets = {
  stats: GoStats[];
  moves: GoMoves[] | null;
  buddies: Record<string, (GoIdentity & { distance: number })[]> | null;
  candy: Record<string, (GoIdentity & { candy_required: number })[]> | null;
  types: (GoIdentity & { type: string[] })[] | null;
  released: Record<string, { id: number; name: string }> | null;
  shiny: Record<string, { id: number; name: string }> | null;
};
export type GoForm = {
  form: string;
  attack: number;
  defense: number;
  stamina: number;
  types: string[];
  moves: GoMoves | null;
  buddyDistance: number | null;
  candyCosts: number[] | null;
};
export type GoSpecies = {
  id: number;
  name: string;
  released: boolean | null;
  shiny: boolean | null;
  forms: GoForm[];
};
const formKey = (value?: string) => (value || 'Normal').toLowerCase();
function indexByForm<T extends GoIdentity>(rows: T[]) {
  const index = new Map<string, T[]>();
  for (const row of rows) {
    const key = `${row.pokemon_id}:${formKey(row.form)}`;
    index.set(key, [...(index.get(key) || []), row]);
  }
  return (row: GoIdentity) =>
    index.get(`${row.pokemon_id}:${formKey(row.form)}`) || [];
}
export function buildGoSpecies(data: GoDatasets): GoSpecies[] {
  const moves = indexByForm(data.moves || []);
  const buddies = indexByForm(Object.values(data.buddies || {}).flat());
  const candy = indexByForm(Object.values(data.candy || {}).flat());
  const types = indexByForm(data.types || []);
  const species = new Map<number, GoSpecies>();
  for (const row of data.stats) {
    if (
      !Number.isInteger(row.pokemon_id) ||
      ![row.base_attack, row.base_defense, row.base_stamina].every(
        Number.isFinite,
      )
    )
      continue;
    let entry = species.get(row.pokemon_id);
    if (!entry) {
      entry = {
        id: row.pokemon_id,
        name: row.pokemon_name,
        released: data.released
          ? Boolean(data.released[String(row.pokemon_id)])
          : null,
        shiny: data.shiny ? Boolean(data.shiny[String(row.pokemon_id)]) : null,
        forms: [],
      };
      species.set(row.pokemon_id, entry);
    }
    if (entry.forms.some((f) => formKey(f.form) === formKey(row.form)))
      continue;
    entry.forms.push({
      form: row.form || 'Normal',
      attack: row.base_attack,
      defense: row.base_defense,
      stamina: row.base_stamina,
      types: (types(row)[0]?.type || []).map((t) => t.toLowerCase()),
      moves: moves(row)[0] || null,
      buddyDistance: buddies(row)[0]?.distance ?? null,
      candyCosts: data.candy
        ? [...new Set(candy(row).map((c) => c.candy_required))].sort(
            (a, b) => a - b,
          )
        : null,
    });
  }
  for (const entry of species.values())
    entry.forms.sort((a, b) =>
      a.form === 'Normal'
        ? -1
        : b.form === 'Normal'
          ? 1
          : a.form.localeCompare(b.form),
    );
  return [...species.values()].sort((a, b) => a.id - b.id);
}
