// Opt-in checks against a running production container and live GO datasets.
import assert from 'node:assert/strict';
const base = process.argv[2] || 'http://localhost:3010';
async function html(path) {
  const r = await fetch(new URL(path, base), {
    signal: AbortSignal.timeout(40000),
  });
  assert.equal(r.status, 200, path);
  return (await r.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
}
const search = await html('/pokemon-go?q=bulbasaur');
assert.ok(search.includes('Bulbasaur'));
const body = search.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1];
assert.ok(body);
assert.equal((body.match(/<tr>/g) || []).length, 1);
assert.ok(search.includes('/pokemon/bulbasaur#pokemon-go'));
const sorted = await html('/pokemon-go?sort=attack&released=1');
const sortedBody = sorted.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1];
assert.ok(sortedBody);
const values = [...sortedBody.matchAll(/<td>(\d+)<\/td>/g)].map((m) =>
  Number(m[1]),
);
const attacks = values.filter((_, i) => i % 3 === 0);
assert.ok(attacks.length > 1);
assert.ok(attacks.every((a, i) => i === 0 || attacks[i - 1] >= a));
assert.ok(!sortedBody.includes('Unconfirmed'));
assert.ok(
  (await html('/pokemon-go?q=zzzzzzz')).includes('No GO records match.'),
);
const profile = await html('/pokemon/bulbasaur');
for (const text of [
  'id="pokemon-go"',
  'GO form',
  'Base Attack',
  'Vine Whip',
  'Buddy distance',
  'Evolution candy',
])
  assert.ok(profile.includes(text), text);
assert.ok(!profile.includes('Community data from'));
assert.ok((await html('/pokemon/raichu')).includes('value="Alola"'));
console.log(
  'GO guide search/sort/release filtering, empty results, profile integration, and alternate-form options passed.',
);
