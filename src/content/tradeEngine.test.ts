import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createTrade, tradeReducer, TradeAction, TradeState, readyToMake, profit, accepted, lessons, stockOnHand, siliconInStore, cashLeft } from './tradeEngine';
import { NORWAY_MARKET as M } from './norwayMarket';

const play = (actions: TradeAction[], s: TradeState = createTrade(M, '')) => actions.reduce((st, a) => tradeReducer(M, st, a), s);
/** Order, check, (dispute,) pay the newest order of a supplier. */
function buy(s: TradeState, supplierId: string, lots = 1, dispute = false) {
  let st = tradeReducer(M, s, { type: 'order', supplierId, lots });
  const id = st.orders[st.orders.length - 1].id;
  st = tradeReducer(M, st, { type: 'check', orderId: id });
  if (dispute) st = tradeReducer(M, st, { type: 'dispute', orderId: id });
  return tradeReducer(M, st, { type: 'pay', orderId: id });
}
const sell = (s: TradeState, haggle: boolean) =>
  play([{ type: 'make' }, { type: 'made' }, ...(haggle ? [
    { type: 'getQuote', competitorId: 'silicones' }, { type: 'askBuyer', leverId: 'match' }, { type: 'askBuyer', leverId: 'more' },
  ] as TradeAction[] : []), { type: 'sellSpares' }, { type: 'accept' }, haggle ? { type: 'chasePayment' } : { type: 'takePayment' }], s);

describe('loop 2 trade engine (Norway)', () => {
  it('consumes inputs and removes sold goods without rewriting receipt evidence or crediting sales twice', () => {
    let s = buy(createTrade(M), 'fjord', 2);
    s = buy(s, 'harbour', 1, true); s = buy(s, 'sawmill'); s = buy(s, 'hydro');
    assert.equal(stockOnHand(M, s, 'quartz'), 12);
    s = play([{ type: 'make' }, { type: 'made' }], s);
    assert.equal(stockOnHand(M, s, 'quartz'), 2);
    assert.equal(stockOnHand(M, s, 'carbon'), 1);
    assert.equal(stockOnHand(M, s, 'chips'), 0);
    assert.equal(stockOnHand(M, s, 'power'), 0);
    assert.equal(siliconInStore(s), true);
    const received = accepted(s, 'quartz');
    s = tradeReducer(M, s, { type: 'sellSpares' });
    assert.equal(stockOnHand(M, s, 'quartz'), 0);
    assert.equal(stockOnHand(M, s, 'carbon'), 0);
    assert.equal(accepted(s, 'quartz'), received);
    const cash = cashLeft(M, s);
    s = tradeReducer(M, s, { type: 'sellSpares' });
    assert.equal(cashLeft(M, s), cash);
    s = tradeReducer(M, s, { type: 'accept' });
    assert.equal(siliconInStore(s), false);
    const soldCash = cashLeft(M, s);
    s = tradeReducer(M, s, { type: 'accept' });
    assert.equal(cashLeft(M, s), soldCash);
  });

  it('keeps non-resellable extra electricity after selling material spares', () => {
    let s = buy(createTrade(M), 'nordic'); s = buy(s, 'harbour', 1, true);
    s = buy(s, 'sawmill'); s = buy(s, 'hydro', 2);
    s = play([{ type: 'make' }, { type: 'made' }, { type: 'sellSpares' }], s);
    assert.equal(stockOnHand(M, s, 'power'), 1);
    assert.equal(stockOnHand(M, s, 'quartz'), 0);
  });

  it('requires fresh sample knowledge after changing preparation, while price-only negotiation keeps it', () => {
    let s = play([{ type: 'sample', supplierId: 'fjord' }, { type: 'ask', supplierId: 'fjord', leverId: 'screen' }]);
    assert.ok(!s.sampled.includes('fjord'));
    s = tradeReducer(M, s, { type: 'sample', supplierId: 'fjord' });
    assert.ok(s.sampled.includes('fjord'));
    s = play([{ type: 'sample', supplierId: 'harbour' }, { type: 'ask', supplierId: 'harbour', leverId: 'cheaper' }], s);
    assert.ok(s.sampled.includes('harbour'));
  });

  it('careful play breaks even or better', () => {
    let s = play([{ type: 'ask', supplierId: 'nordic', leverId: 'smaller' }, { type: 'ask', supplierId: 'harbour', leverId: 'cheaper' }, { type: 'ask', supplierId: 'sawmill', leverId: 'cheaper' }]);
    s = buy(s, 'nordic'); s = buy(s, 'harbour', 1, true); s = buy(s, 'sawmill'); s = buy(s, 'hydro');
    assert.ok(readyToMake(M, s));
    s = sell(s, true);
    assert.equal(s.phase, 'done');
    assert.ok(profit(M, s) >= 0, `profit ${profit(M, s)}`);
  });

  it('crushed rock bought without a sample leaves the furnace short', () => {
    let s = buy(createTrade(M, ''), 'fjord');
    assert.equal(accepted(s, 'quartz'), 6);
    s = buy(s, 'harbour'); s = buy(s, 'sawmill'); s = buy(s, 'hydro');
    assert.equal(readyToMake(M, s), false);
    assert.equal(tradeReducer(M, s, { type: 'make' }).phase, 'buy');
  });

  it('paying without checking the invoice costs money; disputing fixes it', () => {
    const paid = buy(createTrade(M, ''), 'harbour');
    assert.equal(paid.orders[0].paid, 72);
    const fixed = buy(createTrade(M, ''), 'harbour', 1, true);
    assert.equal(fixed.orders[0].paid, 60);
  });

  it('suppliers stop negotiating when out of patience, and refusals change nothing', () => {
    let s = play([{ type: 'ask', supplierId: 'nordic', leverId: 'cheaper' }]);
    assert.deepEqual(s.terms.nordic, M.suppliers.find(x => x.id === 'nordic')!.terms);
    s = play([{ type: 'ask', supplierId: 'harbour', leverId: 'cheaper' }, { type: 'ask', supplierId: 'harbour', leverId: 'cheaper' }]);
    assert.equal(s.terms.harbour.unitPrice, 11);
  });

  it('careless play loses money and the lessons say why', () => {
    let s = buy(createTrade(M, ''), 'fjord'); s = buy(s, 'fjord');
    s = buy(s, 'harbour'); s = buy(s, 'sawmill'); s = buy(s, 'hydro');
    s = sell(s, false);
    assert.ok(profit(M, s) < 0);
    const text = lessons(M, s).join(' ');
    assert.match(text, /invoice/); assert.match(text, /sample/); assert.match(text, /first offer/);
  });

  it('a competing quote lifts the sale, and a short payment can be chased', () => {
    let s: TradeState = { ...createTrade(M), phase: 'sell' };
    s = tradeReducer(M, s, { type: 'askBuyer', leverId: 'match' });
    assert.equal(s.sale.offer, 560, 'no quote yet: nothing to match');
    s = tradeReducer(M, s, { type: 'getQuote', competitorId: 'silicones' });
    s = tradeReducer(M, s, { type: 'askBuyer', leverId: 'match' });
    assert.equal(s.sale.offer, 610);
    s = tradeReducer(M, s, { type: 'askBuyer', leverId: 'more' });
    assert.equal(s.sale.offer, 620, 'capped');
    s = tradeReducer(M, s, { type: 'accept' });
    assert.equal(s.phase, 'payment');
    assert.equal(s.sale.received, 595);
    const chased = tradeReducer(M, s, { type: 'chasePayment' });
    assert.equal(chased.sale.received, 620);
    assert.equal(chased.phase, 'done');
    assert.equal(tradeReducer(M, s, { type: 'takePayment' }).sale.received, 595);
  });
});
