// Opt-in integration checks against a running production server and real PokéAPI.
import assert from 'node:assert/strict';
const base = process.argv[2] || 'http://localhost:3010';
async function request(path) {
  return fetch(new URL(path, base), { signal: AbortSignal.timeout(40000) });
}
const health = await request('/api/health');
assert.equal(health.status, 200);
assert.deepEqual(await health.json(), { status: 'ok' });
const search = await request('/api/search?q=%230025');
assert.equal(search.status, 200);
const found = await search.json();
assert.equal(found.results.length, 1);
assert.equal(found.results[0].name, 'pikachu');
assert.match(search.headers.get('cache-control'), /s-maxage/);
const typed = await (
  await request('/api/search?type=fire&generation=1&limit=48')
).json();
assert.ok(typed.results.length > 0);
assert.ok(typed.results.every((p) => p.types.includes('fire') && p.id <= 151));
assert.equal((await request('/api/search?limit=999')).status, 400);
assert.equal((await (await request('/api/search?q=zzzzzzzz')).json()).total, 0);
const last = await (await request('/api/search?page=9999')).json();
assert.equal(last.page, last.pages);
assert.ok(last.results.every((p) => p.id <= last.nationalTotal));
for (const [path, expected] of [
  ['/', 'Bulbasaur'],
  ['/?q=pikachu', 'Pikachu'],
  ['/pokemon/bulbasaur', 'Base stats'],
  ['/pokemon/deoxys', 'Deoxys'],
  ['/matchup?attack=rock&defender=fire&secondary=flying', 'Super effective'],
]) {
  const response = await request(path);
  assert.equal(response.status, 200, path);
  const html = await response.text();
  const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  assert.ok(visible.includes(expected), `SSR content missing on ${path}`);
  assert.ok(
    !html.includes('A little interference.'),
    `Upstream failure on ${path}`,
  );
}
const cachedProfile = await request('/pokemon/bulbasaur');
assert.equal(cachedProfile.headers.get('x-nextjs-cache'), 'HIT');
assert.match(cachedProfile.headers.get('cache-control'), /s-maxage=21600/);
const invalidQuery = await request('/api/search?limit=999');
assert.equal(invalidQuery.headers.get('cache-control'), 'no-store');
const alias = await request('/pokemon/25');
assert.ok(alias.url.endsWith('/pokemon/pikachu'));
const missing = await request('/pokemon/not-a-pokemon');
assert.match(await missing.text(), /Off the map/);
assert.equal((await request('/favicon.ico')).status, 200);
console.log(
  'Production smoke checks passed: health, API validation/filtering/pagination, SSR catalog/profiles/type lab, canonical redirects, missing pages, and static assets.',
);
