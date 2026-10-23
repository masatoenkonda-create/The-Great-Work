import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createTrade, tradeReducer, TradeAction, TradeState, readyToMake, profit, accepted, lessons, stockOnHand, siliconInStore, cashLeft, knowsTerms } from './tradeEngine';
import { NORWAY_MARKET as M } from './norwayMarket';

const play = (actions: TradeAction[], s: TradeState) => actions.reduce((st, a) => tradeReducer(M, st, a), s);
const start = (scenario = 'invoice') => createTrade(M, '', 0, scenario);
const everyone: TradeAction[] = M.suppliers.map(x => ({ type: 'rfq', supplierId: x.id }));
/** Quote every supplier, use the best competing quote, and get Germany's order at its cap. */
const agree = (s: TradeState) => play([...everyone, { type: 'getQuote', competitorId: 'silicones' }, { type: 'quoteCustomer', price: 700 },
  { type: 'askBuyer', leverId: 'match' }, { type: 'askBuyer', leverId: 'more' }, { type: 'quoteCustomer', price: 620 }], s);
/** Germany's order without haggling: quote high, take its counter. */
const agreeCareless = (s: TradeState) => play([...everyone, { type: 'quoteCustomer', price: 700 }, { type: 'acceptOffer' }], s);

/** Order, settle the confirmation, check, settle any claim, (dispute,) pay the newest order of a supplier. */
function buy(s: TradeState, supplierId: string, lots = 1, careful = true) {
  let st = tradeReducer(M, s, { type: 'order', supplierId, lots });
  const id = st.orders[st.orders.length - 1].id;
  const o = () => st.orders.find(x => x.id === id)!;
  if (!o().confirmed) st = tradeReducer(M, st, { type: careful ? 'rejectConfirmation' : 'acceptConfirmation', orderId: id });
  st = tradeReducer(M, st, { type: 'check', orderId: id });
  if (o().damaged) st = tradeReducer(M, st, { type: careful ? 'claim' : 'keep', orderId: id });
  if (careful) st = tradeReducer(M, st, { type: 'dispute', orderId: id });
  return o().paid === null ? tradeReducer(M, st, { type: 'pay', orderId: id }) : st;
}
const finish = (s: TradeState, careful: boolean) =>
  play([{ type: 'make' }, { type: 'made' }, ...(careful ? [{ type: 'sellSpares' }] as TradeAction[] : []), { type: 'accept' }, careful ? { type: 'chasePayment' } : { type: 'takePayment' }], s);
const asks: TradeAction[] = [{ type: 'ask', supplierId: 'nordic', leverId: 'smaller' }, { type: 'ask', supplierId: 'harbour', leverId: 'cheaper' }, { type: 'ask', supplierId: 'sawmill', leverId: 'cheaper' }];
function careful(scenario: string) {
  let s = play(asks, agree(start(scenario)));
  s = buy(s, 'nordic'); s = buy(s, 'harbour'); s = buy(s, 'sawmill'); s = buy(s, 'hydro');
  assert.ok(readyToMake(M, s));
  return finish(s, true);
}
function careless(scenario: string) {
  let s = agreeCareless(start(scenario));
  s = buy(s, 'fjord', 1, false); s = buy(s, 'fjord', 1, false);
  s = buy(s, 'harbour', 1, false); s = buy(s, 'sawmill', 1, false); s = buy(s, 'hydro', 1, false);
  return finish(s, false);
}

describe('loop 2 trade engine (Norway, demand first)', () => {
  it('opens with Germany asking for a quote; suppliers show terms only once asked', () => {
    let s = start();
    assert.equal(s.phase, 'enquiry');
    assert.match(s.speaker!, /Germany/);
    assert.equal(knowsTerms(M, s, 'fjord'), false);
    s = tradeReducer(M, s, { type: 'sample', supplierId: 'fjord' });
    assert.ok(!s.sampled.includes('fjord'), 'no sample before a quote');
    s = tradeReducer(M, s, { type: 'rfq', supplierId: 'fjord' });
    assert.ok(knowsTerms(M, s, 'fjord'));
    assert.match(s.message, /screened/);
    assert.equal(tradeReducer(M, s, { type: 'order', supplierId: 'fjord', lots: 1 }).orders.length, 0, 'no buying before the customer orders');
  });

  it('a quote above what Germany can pay gets a counter; leverage lifts it; the agreed price is fixed', () => {
    let s = play([{ type: 'rfq', supplierId: 'nordic' }, { type: 'quoteCustomer', price: 700 }], start());
    assert.equal(s.phase, 'enquiry');
    assert.equal(s.sale.countered, true);
    assert.match(s.message, /\$560/);
    s = tradeReducer(M, s, { type: 'askBuyer', leverId: 'match' });
    assert.equal(s.sale.offer, 560, 'no competing quote yet: nothing to match');
    s = play([{ type: 'getQuote', competitorId: 'silicones' }, { type: 'askBuyer', leverId: 'match' }], s);
    assert.equal(s.sale.offer, 610);
    s = play([{ type: 'askBuyer', leverId: 'more' }, { type: 'quoteCustomer', price: 620 }], s);
    assert.equal(s.phase, 'buy');
    assert.equal(s.sale.ordered, 620);
    assert.equal(tradeReducer(M, s, { type: 'quoteCustomer', price: 700 }).sale.ordered, 620, 'binding once ordered');
  });

  it('quoting before asking any supplier is noted as a blind promise', () => {
    const s = play([{ type: 'quoteCustomer', price: 500 }], start());
    assert.equal(s.sale.ordered, 500);
    assert.match(lessons(M, s).join(' '), /before any supplier/);
  });

  it('careful play ends about +$44 in every scenario; careless play loses money', () => {
    for (const sc of M.scenarios!) {
      const good = careful(sc.id);
      assert.equal(good.phase, 'done');
      assert.equal(profit(M, good), 44, sc.id);
      const bad = careless(sc.id);
      assert.equal(bad.phase, 'done');
      assert.ok(profit(M, bad) < -100, `${sc.id}: ${profit(M, bad)}`);
    }
  });

  it('a changed confirmation: rejecting it returns to the order price, accepting it costs the difference', () => {
    const s = agree(start('harbour-confirm'));
    const ordered = tradeReducer(M, s, { type: 'order', supplierId: 'harbour', lots: 1 });
    const o = ordered.orders[0];
    assert.equal(o.confirmed, false);
    assert.equal(o.confirmation, 70);
    assert.equal(tradeReducer(M, ordered, { type: 'check', orderId: o.id }).orders[0].checked, false, 'nothing ships before the confirmation is settled');
    const rejected = tradeReducer(M, ordered, { type: 'rejectConfirmation', orderId: o.id });
    assert.equal(rejected.orders[0].expected, 60);
    assert.equal(rejected.orders[0].confirmation, 60);
    const taken = tradeReducer(M, ordered, { type: 'acceptConfirmation', orderId: o.id });
    assert.equal(taken.orders[0].expected, 70);
    assert.equal(taken.orders[0].invoice, 70);
    assert.match(lessons(M, taken).join(' '), /\$10 gone/);
    assert.equal(tradeReducer(M, s, { type: 'order', supplierId: 'harbour', lots: 1 }).orders[0].invoice, 60, 'one paperwork error per run: the invoice is right');
  });

  it('prepaid wet coal: paid at order, a claim credits the damaged bags, and the factory waits for the decision', () => {
    let s = agree(start('invoice'));
    s = tradeReducer(M, s, { type: 'order', supplierId: 'bulk', lots: 1 });
    const id = s.orders[0].id;
    assert.equal(s.orders[0].paid, 120, 'paid in advance');
    const paidCash = cashLeft(M, s);
    s = tradeReducer(M, s, { type: 'check', orderId: id });
    assert.match(s.speaker!, /Sigurd/);
    assert.match(s.message, /wet/);
    assert.equal(accepted(s, 'carbon'), 16);
    s = buy(buy(buy(s, 'nordic'), 'sawmill'), 'hydro');
    assert.equal(readyToMake(M, s), false, 'the damaged bags still need a decision');
    const claimed = tradeReducer(M, s, { type: 'claim', orderId: id });
    assert.equal(claimed.orders[0].credit, 24);
    assert.equal(cashLeft(M, claimed), cashLeft(M, s) + 24);
    assert.ok(readyToMake(M, claimed));
    const kept = tradeReducer(M, s, { type: 'keep', orderId: id });
    assert.ok(readyToMake(M, kept));
    assert.match(lessons(M, kept).join(' '), /without a claim: \$24 lost/);
    assert.ok(paidCash < M.cash);
  });

  it('a claim on crushed rock is refused: it was sold with its fines', () => {
    let s = agree(start());
    s = tradeReducer(M, s, { type: 'order', supplierId: 'fjord', lots: 1 });
    s = play([{ type: 'check', orderId: 'PO-1' }, { type: 'claim', orderId: 'PO-1' }], s);
    assert.equal(s.orders[0].claim, 'refused');
    assert.equal(s.orders[0].credit, 0);
    assert.match(s.message, /screened/);
  });

  it('paying without checking the invoice costs money; disputing fixes it (invoice scenario)', () => {
    const s = agree(start('invoice'));
    assert.equal(buy(s, 'harbour', 1, false).orders[0].paid, 72);
    assert.equal(buy(s, 'harbour').orders[0].paid, 60);
  });

  it('consumes inputs and removes sold goods without rewriting receipt evidence or crediting sales twice', () => {
    let s = agree(start('harbour-confirm'));
    s = buy(s, 'fjord', 2); s = buy(s, 'harbour'); s = buy(s, 'sawmill'); s = buy(s, 'hydro');
    assert.equal(stockOnHand(M, s, 'quartz'), 12);
    s = play([{ type: 'make' }, { type: 'made' }], s);
    assert.equal(stockOnHand(M, s, 'quartz'), 2);
    assert.equal(stockOnHand(M, s, 'carbon'), 1);
    assert.equal(stockOnHand(M, s, 'power'), 0);
    assert.equal(siliconInStore(s), true);
    const received = accepted(s, 'quartz');
    s = play([{ type: 'sellSpares' }], s);
    assert.equal(stockOnHand(M, s, 'quartz'), 0);
    assert.equal(accepted(s, 'quartz'), received);
    const cash = cashLeft(M, s);
    s = play([{ type: 'sellSpares' }], s);
    assert.equal(cashLeft(M, s), cash);
    s = play([{ type: 'accept' }], s);
    assert.equal(siliconInStore(s), false);
    assert.equal(s.sale.price, 620, 'delivered at the ordered price');
    const soldCash = cashLeft(M, s);
    assert.equal(cashLeft(M, play([{ type: 'accept' }], s)), soldCash);
  });

  it('requires fresh sample knowledge after changing preparation, while price-only negotiation keeps it', () => {
    let s = play([{ type: 'rfq', supplierId: 'fjord' }, { type: 'sample', supplierId: 'fjord' }, { type: 'ask', supplierId: 'fjord', leverId: 'screen' }], start());
    assert.ok(!s.sampled.includes('fjord'));
    s = play([{ type: 'sample', supplierId: 'fjord' }, { type: 'rfq', supplierId: 'harbour' }, { type: 'sample', supplierId: 'harbour' }, { type: 'ask', supplierId: 'harbour', leverId: 'cheaper' }], s);
    assert.ok(s.sampled.includes('fjord'));
    assert.ok(s.sampled.includes('harbour'));
  });

  it('suppliers stop negotiating when out of patience, and refusals change nothing', () => {
    let s = play([{ type: 'rfq', supplierId: 'nordic' }, { type: 'ask', supplierId: 'nordic', leverId: 'cheaper' }], start());
    assert.deepEqual(s.terms.nordic, M.suppliers.find(x => x.id === 'nordic')!.terms);
    s = play([{ type: 'rfq', supplierId: 'harbour' }, { type: 'ask', supplierId: 'harbour', leverId: 'cheaper' }, { type: 'ask', supplierId: 'harbour', leverId: 'cheaper' }], s);
    assert.equal(s.terms.harbour.unitPrice, 11);
  });

  it('careless play: the lessons say why', () => {
    const text = lessons(M, careless('invoice')).join(' ');
    assert.match(text, /invoice/); assert.match(text, /A sample/); assert.match(text, /up to \$620/); assert.match(text, /short of your invoice/);
  });

  it('trying again starts the next scenario', () => {
    const done = careful('invoice');
    const again = tradeReducer(M, done, { type: 'retry' });
    assert.equal(again.phase, 'enquiry');
    assert.equal(again.scenario, 'harbour-confirm');
    assert.equal(tradeReducer(M, tradeReducer(M, careful('nordic-confirm'), { type: 'retry' }), { type: 'retry' }).scenario, 'invoice');
  });
});
