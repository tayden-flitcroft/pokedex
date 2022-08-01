import test from 'node:test';
import assert from 'node:assert/strict';
import fixture from './fixtures/type-chart.json';
import {
  effectiveness,
  defenses,
  effectivenessLabel,
  type TypeChart,
} from '../src/lib/effectiveness';
const chart = fixture as TypeChart;
test('Rock is 4× against Fire/Flying', () =>
  assert.equal(effectiveness(chart, 'rock', ['fire', 'flying']), 4));
test('Ground immunity overrides a Fire weakness', () =>
  assert.equal(effectiveness(chart, 'ground', ['fire', 'flying']), 0));
test('Fire is quarter damage against Water/Dragon', () =>
  assert.equal(effectiveness(chart, 'fire', ['water', 'dragon']), 0.25));
test('Grass/Poison cancels the Ground resistance and weakness', () =>
  assert.equal(effectiveness(chart, 'ground', ['grass', 'poison']), 1));
test('Duplicate types do not multiply twice', () =>
  assert.equal(effectiveness(chart, 'fire', ['grass', 'grass']), 2));
test('Normal/Ghost has three immunities', () =>
  assert.deepEqual(
    defenses(chart, ['normal', 'ghost'])
      .filter((r) => r.multiplier === 0)
      .map((r) => r.type),
    ['normal', 'fighting', 'ghost'],
  ));
test('All 18 incoming types are represented exactly once', () =>
  assert.equal(
    new Set(defenses(chart, ['steel', 'fairy']).map((r) => r.type)).size,
    18,
  ));
test('Immunity has its own result label', () =>
  assert.equal(effectivenessLabel(0), 'No effect'));
