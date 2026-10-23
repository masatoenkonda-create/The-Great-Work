import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createTrade, tradeReducer, TradeAction, TradeState, readyToMake, profit, lessons, stockOnHand, cashLeft, unusedMinimum } from './tradeEngine';
import { GERMANY_MARKET as M } from './germanyMarket';

const SILICON = 620;
const start = (cost = SILICON) => createTrade(M, '', cost);
const play = (actions: TradeAction[], s: TradeState) => actions.reduce((st, a) => tradeReducer(M, st, a), s);
function buy(s: TradeState, supplierId: string, lots = 1, dispute = false) {
  let st = tradeReducer(M, s, { type: 'order', supplierId, lots });
  const id = st.orders[st.orders.length - 1].id;
  st = tradeReducer(M, st, { type: 'check', orderId: id });
  if (dispute) st = tradeReducer(M, st, { type: 'dispute', orderId: id });
  return tradeReducer(M, st, { type: 'pay', orderId: id });
}
const sell = (s: TradeState, haggle: boolean) =>
  play([{ type: 'make' }, { type: 'made' }, ...(haggle ? [
    { type: 'getQuote', competitorId: 'chipwafer' }, { type: 'askBuyer', leverId: 'match' }, { type: 'askBuyer', leverId: 'more' },
  ] as TradeAction[] : []), { type: 'accept' }, haggle ? { type: 'chasePayment' } : { type: 'takePayment' }], s);
const hcl = (s: TradeState) => buy(tradeReducer(M, s, { type: 'ask', supplierId: 'rhine', leverId: 'cheaper' }), 'rhine', 1, true);

describe('loop 2 Germany market', () => {
  it('counts the silicon from Norway once, at the agreed price', () => {
    const s = start();
    assert.equal(cashLeft(M, s), 1200 - SILICON);
    assert.equal(profit(M, s), -SILICON);
    const again = tradeReducer(M, { ...s, phase: 'done' }, { type: 'retry' });
    assert.equal(again.carriedCost, SILICON, 'trying Germany again keeps the same silicon cost');
  });

  it('a contract minimum is billed but never becomes stock', () => {
    let s = buy(start(), 'alpine');
    const o = s.orders[0];
    assert.equal(o.paid, 300);
    assert.equal(unusedMinimum(o), 1);
    assert.equal(stockOnHand(M, s, 'power'), 1, 'only the delivered batch is in the store');
    s = buy(start(), 'park');
    assert.equal(s.orders[0].paid, 120, '9 taken, 10 billed');
    assert.equal(stockOnHand(M, s, 'hydrogen'), 9);
  });

  it('disputing a correct minimum changes nothing', () => {
    let s = tradeReducer(M, start(), { type: 'order', supplierId: 'alpine', lots: 1 });
    s = play([{ type: 'check', orderId: 'PO-1' }, { type: 'dispute', orderId: 'PO-1' }], s);
    assert.equal(s.orders[0].invoice, 300);
    assert.match(s.message, /agreement you signed/);
  });

  it('negotiating a contract rate keeps its minimum and earlier order terms', () => {
    const market = {
      ...M,
      suppliers: M.suppliers.map(s => s.id === 'park' ? {
        ...s, levers: [{ id: 'rate', label: 'Lower rate', reply: 'Same minimum.', change: { priceAdd: -1 } }],
      } : s),
    };
    let s = createTrade(market);
    s = tradeReducer(market, s, { type: 'order', supplierId: 'park', lots: 1 });
    s = tradeReducer(market, s, { type: 'ask', supplierId: 'park', leverId: 'rate' });
    s = tradeReducer(market, s, { type: 'order', supplierId: 'park', lots: 1 });
    assert.equal(s.terms.park.minimum, 10);
    assert.equal(s.orders[0].expected, 120, 'the agreed first order stays fixed');
    assert.equal(s.orders[1].expected, 110, 'the new rate still bills the minimum of 10');
    assert.equal(unusedMinimum(s.orders[1]), 1, 'the undelivered minimum is not extra stock');
  });

  it('the spec sheet shows the acid is not the gas; buying it blind leaves the reactor short', () => {
    const s = tradeReducer(M, start(), { type: 'sample', supplierId: 'discount' });
    assert.match(s.message, /not the dry gas/);
    let t = buy(start(), 'discount'); t = buy(t, 'park'); t = buy(t, 'grid');
    assert.equal(readyToMake(M, t), false);
  });

  it('careful play: pipeline contract, pay-as-you-go power, a positive result', () => {
    let s = hcl(start()); s = buy(s, 'park'); s = buy(s, 'grid');
    assert.ok(readyToMake(M, s));
    s = sell(s, true);
    assert.equal(profit(M, s), 68);
    assert.match(lessons(M, s).join(' '), /lower rate really was cheaper/);
  });

  it('careful play stays positive at Norway’s lowest agreed price too', () => {
    let s = hcl(start(560)); s = buy(s, 'park'); s = buy(s, 'grid');
    assert.equal(profit(M, sell(s, true)), 128);
  });

  it('signing both contracts turns a careful run into a loss, and the lessons say why', () => {
    let s = hcl(start()); s = buy(s, 'park'); s = buy(s, 'alpine');
    s = sell(s, true);
    assert.equal(profit(M, s), -12);
    assert.match(lessons(M, s).join(' '), /Alpine Hydro: you paid \$150 under the contract minimum/);
  });

  it('paying as you go for both is safe but leaves money on the table', () => {
    let s = hcl(start()); s = buy(s, 'depot', 3); s = buy(s, 'grid');
    assert.equal(profit(M, sell(s, true)), 34);
  });

  it('careless play loses money', () => {
    let s = buy(start(560), 'discount'); s = buy(s, 'rhine'); s = buy(s, 'depot', 3); s = buy(s, 'alpine');
    s = sell(s, false);
    assert.equal(profit(M, s), -209);
    const text = lessons(M, s).join(' ');
    assert.match(text, /spec sheet/); assert.match(text, /invoice/); assert.match(text, /contract minimum/);
  });
});
