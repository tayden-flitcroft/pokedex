import test from 'node:test';
import assert from 'node:assert/strict';
import { buildGoSpecies, type GoDatasets } from '../src/lib/pokemon-go-model';
import { fetchGoData } from '../src/lib/pokemon-go';
const normal = {
  pokemon_id: 26,
  pokemon_name: 'Raichu',
  form: 'Normal',
  base_attack: 193,
  base_defense: 151,
  base_stamina: 155,
};
const alola = { ...normal, form: 'Alola', base_attack: 201, base_defense: 154 };
const datasets: GoDatasets = {
  stats: [alola, normal],
  moves: [
    {
      ...normal,
      fast_moves: ['Volt Switch'],
      charged_moves: ['Thunder'],
      elite_fast_moves: [],
      elite_charged_moves: [],
    },
  ],
  buddies: { '1': [{ ...normal, distance: 1 }] },
  candy: {
    '50': [
      { ...normal, candy_required: 50 },
      { ...normal, candy_required: 50 },
    ],
  },
  types: [
    { ...alola, type: ['Electric', 'Psychic'] },
    { ...normal, type: ['Electric'] },
  ],
  released: { '26': { id: 26, name: 'Raichu' } },
  shiny: {},
};
test('GO forms preserve distinct stats and put Normal first', () => {
  const p = buildGoSpecies(datasets)[0];
  assert.equal(p.forms[0].form, 'Normal');
  assert.equal(p.forms[1].attack, 201);
  assert.deepEqual(p.forms[1].types, ['electric', 'psychic']);
});
test('Moves, buddy distance, and candy are never borrowed from a different form', () => {
  const p = buildGoSpecies(datasets)[0];
  assert.equal(p.forms[0].buddyDistance, 1);
  assert.equal(p.forms[1].buddyDistance, null);
  assert.equal(p.forms[1].moves, null);
  assert.deepEqual(p.forms[1].candyCosts, []);
});
test('Repeated evolution costs are deduplicated', () =>
  assert.deepEqual(buildGoSpecies(datasets)[0].forms[0].candyCosts, [50]));
test('Missing supplemental sources remain unknown, distinct from absent records', () => {
  const p = buildGoSpecies({
    ...datasets,
    released: null,
    shiny: null,
    candy: null,
  })[0];
  assert.equal(p.released, null);
  assert.equal(p.shiny, null);
  assert.equal(p.forms[0].candyCosts, null);
  assert.equal(buildGoSpecies(datasets)[0].shiny, false);
});
test('Unavailable optional endpoints still return usable GO stats', async (t) => {
  const original = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = original;
  });
  globalThis.fetch = async (url) =>
    String(url).endsWith('/pokemon_stats.json')
      ? Response.json([normal])
      : new Response('', { status: 503 });
  const data = await fetchGoData();
  assert.equal(data.partial, true);
  assert.equal(data.species[0].forms[0].attack, 193);
  assert.equal(data.species[0].released, null);
});
test('A failed core GO source throws for the section-level fallback', async (t) => {
  const original = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = original;
  });
  globalThis.fetch = async () => new Response('', { status: 503 });
  await assert.rejects(fetchGoData(), /GO stats are unavailable/);
});
