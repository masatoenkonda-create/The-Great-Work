import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BUDGET, NORWAY_ITEMS, Choices, plannedTotal, resolveOrders, fixesFor, billLines } from './norwayProcurement';

const cheapest: Choices = { quartz: 'fjord', coal: 'harbour', woodchips: 'sawmill', power: 'spot' };
const safest: Choices = { quartz: 'nordic', coal: 'harbour', woodchips: 'timber', power: 'fixed' };

describe('Norway procurement prototype', () => {
  it('every offer covers the need on its own', () => {
    for (const item of NORWAY_ITEMS) for (const offer of item.offers) assert.ok(offer.lot >= item.need, `${item.id}/${offer.id}`);
  });

  it('the safe plan fits the budget but costs more than the risky one', () => {
    assert.ok(plannedTotal(safest) <= BUDGET);
    assert.ok(plannedTotal(cheapest) < plannedTotal(safest));
  });

  it('with no bad luck, everything arrives and nothing is short', () => {
    const outcomes = resolveOrders(cheapest, () => 0.99);
    assert.ok(outcomes.every(o => !o.struck && o.shortfall === 0));
    assert.equal(outcomes.reduce((s, o) => s + o.paid, 0), plannedTotal(cheapest));
  });

  it('when every risk strikes, the cheap plan ends up over budget', () => {
    const outcomes = resolveOrders(cheapest, () => 0);
    const quartz = outcomes.find(o => o.item.id === 'quartz')!;
    assert.equal(quartz.shortfall, 6);
    const broker = fixesFor(quartz).find(f => f.id === 'broker')!;
    assert.equal(broker.quantity, 6);
    const chips = outcomes.find(o => o.item.id === 'woodchips')!;
    const fixes = { quartz: broker, woodchips: fixesFor(chips).find(f => f.id === 'broker')! };
    const total = billLines(outcomes, fixes).reduce((s, l) => s + l.paid, 0);
    assert.ok(total > BUDGET, `total ${total}`);
  });

  it('safe suppliers have no risk to roll, and leave leftovers', () => {
    const lines = billLines(resolveOrders(safest, () => 0), {});
    assert.ok(lines.every(l => l.bought >= l.used));
    assert.ok(lines.some(l => l.bought > l.used));
  });
});
