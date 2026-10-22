import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  BUDGET, NEEDS, SUPPLIERS, Terms, ProcurementState, createProcurementState,
  procurementReducer as act, quoteFor, quoteCost, acceptedFor, missingFor,
  readyForFurnace, totalPaid, procurementBill, locationFor,
} from './norwaySourcing';

function buy(s: ProcurementState, supplierId: string, terms: Terms = 'standard', lots = 1) {
  s = act(s, { type: 'visit', supplierId });
  if (terms !== 'standard') s = act(s, { type: 'negotiate', supplierId, terms });
  s = act(s, { type: 'sample', supplierId, terms });
  s = act(s, { type: 'order', supplierId, terms, lots });
  return act(s, { type: 'inspect', orderId: s.orders.at(-1)!.id });
}
function auxiliary(s: ProcurementState) {
  for (const id of ['harbour', 'sawmill', 'hydro']) s = buy(s, id);
  return s;
}

describe('Norway sourcing: need → source → terms → order → acceptance → use', () => {
  it('cannot spend or release without supplier evidence, even with money', () => {
    let s = createProcurementState();
    s = act(s, { type: 'order', supplierId: 'fjord', terms: 'standard', lots: 1 });
    assert.equal(totalPaid(s), 0);
    s = act(s, { type: 'visit', supplierId: 'fjord' });
    s = act(s, { type: 'order', supplierId: 'fjord', terms: 'standard', lots: 1 });
    assert.equal(s.orders.length, 0);
    assert.equal(act(s, { type: 'start' }).phase, 'source');
  });

  it('buying ten mixed portions releases six chunks, not ten; the shortfall blocks the furnace', () => {
    const s = auxiliary(buy(createProcurementState(), 'fjord'));
    assert.equal(s.orders[0].paid, 180);
    assert.equal(s.orders[0].excluded, 4);
    assert.equal(acceptedFor(s, 'quartz'), 6);
    assert.equal(missingFor(s, 'quartz'), 4);
    assert.ok(totalPaid(s) < BUDGET);
    assert.equal(readyForFurnace(s), false);
    assert.equal(act(s, { type: 'start' }).phase, 'source');
  });

  it('amending terms requires negotiation and a new sample; issued orders retain original terms', () => {
    let s = buy(createProcurementState(), 'fjord');
    s = act(s, { type: 'sample', supplierId: 'fjord', terms: 'screened' });
    assert.ok(!s.samples.includes('fjord:screened'));
    s = act(s, { type: 'negotiate', supplierId: 'fjord', terms: 'screened' });
    s = act(s, { type: 'order', supplierId: 'fjord', terms: 'screened', lots: 1 });
    assert.equal(s.orders.length, 1);
    s = buy(s, 'fjord', 'screened');
    assert.equal(s.orders[0].quote.terms, 'standard');
    assert.equal(s.orders[0].paid, 180);
    assert.equal(s.orders[1].paid, 280);
    assert.equal(acceptedFor(s, 'quartz'), 16);
  });

  it('smaller packs can cost more per portion and less in total; repacking is charged once per order', () => {
    const full = quoteFor('nordic'); const split = quoteFor('nordic', 'split');
    assert.ok(split.unitPrice > full.unitPrice);
    assert.ok(quoteCost(split, 1) < quoteCost(full, 1));
    assert.equal(quoteCost(split, 2), 510);
    assert.equal(totalPaid(auxiliary(buy(createProcurementState(), 'nordic', 'split'))), 590);
  });

  it('issued and paid supply is not accepted stock; receipt inspection is idempotent', () => {
    let s = createProcurementState();
    for (const action of [
      { type: 'visit' as const, supplierId: 'nordic' },
      { type: 'sample' as const, supplierId: 'nordic', terms: 'standard' as const },
      { type: 'order' as const, supplierId: 'nordic', terms: 'standard' as const, lots: 1 },
    ]) s = act(s, action);
    assert.equal(totalPaid(s), 350);
    assert.equal(acceptedFor(s, 'quartz'), 0);
    assert.equal(act(s, { type: 'order', supplierId: 'nordic', terms: 'standard', lots: 1 }).orders.length, 1);
    s = act(s, { type: 'inspect', orderId: s.orders[0].id });
    const again = act(s, { type: 'inspect', orderId: s.orders[0].id });
    assert.equal(again, s);
    assert.equal(acceptedFor(s, 'quartz'), 25);
    assert.equal(totalPaid(s), 350);
  });

  it('has a feasible qualified path and an over-budget technically qualified path', () => {
    const efficient = auxiliary(buy(createProcurementState(), 'fjord', 'screened'));
    const bulk = auxiliary(buy(createProcurementState(), 'nordic'));
    assert.equal(totalPaid(efficient), 600);
    assert.equal(totalPaid(bulk), 670);
    assert.ok(totalPaid(efficient) <= BUDGET && totalPaid(bulk) > BUDGET);
    for (const s of [efficient, bulk]) {
      assert.ok(readyForFurnace(s));
      assert.equal(act(s, { type: 'start' }).phase, 'work');
    }
  });

  it('lets an insufficient order be corrected, preserving its costs and exclusions', () => {
    const s = auxiliary(buy(buy(createProcurementState(), 'fjord'), 'fjord', 'screened'));
    assert.ok(readyForFurnace(s));
    assert.equal(totalPaid(s), 780);
    assert.equal(acceptedFor(s, 'quartz'), 16);
    assert.equal(s.orders[0].excluded, 4);
  });

  it('conserves bought material through exclusion, consumption and stock; finishing cannot consume twice', () => {
    let s = auxiliary(buy(createProcurementState(), 'fjord', 'standard', 2));
    assert.equal(procurementBill(s).find(l => l.id === 'quartz')!.used, 0);
    s = act(act(s, { type: 'start' }), { type: 'finish' });
    assert.equal(s.phase, 'bill');
    for (const line of procurementBill(s)) {
      assert.equal(line.bought, line.excluded + line.used + line.leftover);
      assert.ok(line.leftover >= 0);
    }
    assert.equal(procurementBill(s).find(l => l.id === 'quartz')!.leftover, 2);
    assert.equal(act(s, { type: 'finish' }), s);
    assert.equal(act(s, { type: 'order', supplierId: 'fjord', terms: 'standard', lots: 1 }), s);
    assert.deepEqual(act(s, { type: 'retry' }), createProcurementState());
  });

  it('rejects invalid quantities/terms and cannot reset an active project to erase spending', () => {
    let s = buy(createProcurementState(), 'fjord');
    for (const lots of [0, -1, 1.5, NaN, Infinity, 6]) {
      assert.equal(act(s, { type: 'order', supplierId: 'fjord', terms: 'standard', lots }), s);
    }
    assert.equal(act(s, { type: 'order', supplierId: 'fjord', terms: 'split', lots: 1 }), s);
    assert.equal(act(s, { type: 'retry' }), s);
  });

  it('every supply has an origin and selling location; a merchant is distinct from its quarry', () => {
    for (const supplier of SUPPLIERS) {
      assert.ok(locationFor(supplier.origin)); assert.ok(locationFor(supplier.location));
      assert.ok(NEEDS.some(n => n.id === supplier.item));
    }
    const merchant = SUPPLIERS.find(s => s.id === 'nordic')!;
    assert.notEqual(merchant.origin, merchant.location);
  });
});
