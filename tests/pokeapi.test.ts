import test from 'node:test';
import assert from 'node:assert/strict';
import {
  pokeFetch,
  UpstreamError,
  MissingPokemonError,
} from '../src/lib/pokeapi';
test('Upstream errors distinguish missing records, outages, and timeouts', async (t) => {
  const original = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = original;
  });
  globalThis.fetch = async () => new Response('', { status: 404 });
  await assert.rejects(pokeFetch('pokemon/missing'), MissingPokemonError);
  globalThis.fetch = async () => new Response('', { status: 503 });
  await assert.rejects(pokeFetch('pokemon/1'), UpstreamError);
  globalThis.fetch = async () => {
    throw new DOMException('Timed out', 'TimeoutError');
  };
  await assert.rejects(pokeFetch('pokemon/1'), UpstreamError);
});
test('Upstream requests carry a cache policy and cancellation signal', async (t) => {
  const original = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = original;
  });
  globalThis.fetch = async (url, options) => {
    assert.equal(url, 'https://pokeapi.co/api/v2/pokemon/1');
    assert.equal(
      (options as RequestInit & { next: { revalidate: number } }).next
        .revalidate,
      86400,
    );
    assert.ok(options?.signal);
    return Response.json({ id: 1 });
  };
  assert.deepEqual(await pokeFetch('pokemon/1'), { id: 1 });
});
