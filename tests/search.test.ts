import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseSearch,
  filterEntries,
  normalizeSearch,
  SearchInputError,
} from '../src/lib/search';
const entries = [
  { id: 1, name: 'bulbasaur' },
  { id: 25, name: 'pikachu' },
  { id: 122, name: 'mr-mime' },
  { id: 152, name: 'chikorita' },
  { id: 906, name: 'sprigatito' },
];
const search = (q: string) =>
  filterEntries(entries, parseSearch(new URLSearchParams(q)));
test('Normalizes punctuation and gender symbols', () => {
  assert.equal(normalizeSearch('Mr. Mime'), 'mrmime');
  assert.equal(normalizeSearch('Nidoran♀'), 'nidoranf');
});
test('Searches partial case-insensitive names', () =>
  assert.deepEqual(
    search('q=PIKA').map((p) => p.id),
    [25],
  ));
test('Searches zero-padded national numbers', () =>
  assert.deepEqual(
    search('q=%230025').map((p) => p.id),
    [25],
  ));
test('Generation boundaries include only the selected generation', () =>
  assert.deepEqual(
    search('generation=2').map((p) => p.id),
    [152],
  ));
test('Sorts descending and combines type filtering', () =>
  assert.deepEqual(
    filterEntries(
      entries,
      parseSearch(new URLSearchParams('sort=number-desc')),
      new Set([1, 906]),
    ).map((p) => p.id),
    [906, 1],
  ));
test('Unknown names produce empty results', () =>
  assert.deepEqual(search('q=not-a-pokemon'), []));
test('Rejects malformed and unbounded API parameters', () => {
  for (const query of [
    'type=stellar',
    'generation=10',
    'page=-1',
    'page=NaN',
    'limit=500',
    'limit=0',
    'page=10001',
    'sort=random',
    `q=${'a'.repeat(81)}`,
  ])
    assert.throws(
      () => parseSearch(new URLSearchParams(query)),
      SearchInputError,
    );
});
