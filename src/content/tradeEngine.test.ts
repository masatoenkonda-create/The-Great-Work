import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createTrade, tradeReducer, TradeAction, TradeState, readyToMake, profit, accepted, lessons } from './tradeEngine';
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
  play([{ type: 'make' }, { type: 'made' }, ...(haggle ? [{ type: 'askBuyer', leverId: 'more' } as TradeAction] : []), { type: 'sellSpares' }, { type: 'accept' }], s);

describe('loop 2 trade engine (Norway)', () => {
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
});

