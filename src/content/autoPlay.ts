import { createTrade, Market, tradeReducer, TradeAction, TradeState } from './tradeEngine';

/**
 * Developer shortcut: a loop-2 stop played carefully from the start, through the real engine, so a
 * finished stop looks exactly like one a player finished (dev panel only; not part of the game).
 * Each step is one action; `buy` orders, checks, optionally disputes and pays the newest order.
 */
export type AutoStep = TradeAction | { type: 'buy'; supplierId: string; lots?: number; dispute?: boolean };

export function autoPlay(m: Market, steps: AutoStep[], carriedCost = 0): TradeState {
  return steps.reduce((s, step) => {
    if (step.type !== 'buy') return tradeReducer(m, s, step);
    let st = tradeReducer(m, s, { type: 'order', supplierId: step.supplierId, lots: step.lots ?? 1 });
    const id = st.orders[st.orders.length - 1].id;
    st = tradeReducer(m, st, { type: 'check', orderId: id });
    if (step.dispute) st = tradeReducer(m, st, { type: 'dispute', orderId: id });
    return tradeReducer(m, st, { type: 'pay', orderId: id });
  }, createTrade(m, m.intro, carriedCost));
}

/** Careful runs, as in each market's tests: Norway about +$44, Germany +$68 at Norway's $620. */
export const NORWAY_CAREFUL: AutoStep[] = [
  { type: 'ask', supplierId: 'nordic', leverId: 'smaller' }, { type: 'ask', supplierId: 'harbour', leverId: 'cheaper' },
  { type: 'ask', supplierId: 'sawmill', leverId: 'cheaper' },
  { type: 'buy', supplierId: 'nordic' }, { type: 'buy', supplierId: 'harbour', dispute: true },
  { type: 'buy', supplierId: 'sawmill' }, { type: 'buy', supplierId: 'hydro' },
  { type: 'make' }, { type: 'made' },
  { type: 'getQuote', competitorId: 'silicones' }, { type: 'askBuyer', leverId: 'match' }, { type: 'askBuyer', leverId: 'more' },
  { type: 'sellSpares' }, { type: 'accept' }, { type: 'chasePayment' },
];

export const GERMANY_CAREFUL: AutoStep[] = [
  { type: 'ask', supplierId: 'rhine', leverId: 'cheaper' }, { type: 'buy', supplierId: 'rhine', dispute: true },
  { type: 'buy', supplierId: 'park' }, { type: 'buy', supplierId: 'grid' },
  { type: 'make' }, { type: 'made' },
  { type: 'getQuote', competitorId: 'chipwafer' }, { type: 'askBuyer', leverId: 'match' }, { type: 'askBuyer', leverId: 'more' },
  { type: 'accept' }, { type: 'chasePayment' },
];
