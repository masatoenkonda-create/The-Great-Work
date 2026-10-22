import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { profit } from './tradeEngine';
import { autoPlay, GERMANY_CAREFUL, NORWAY_CAREFUL } from './autoPlay';
import { NORWAY_MARKET } from './norwayMarket';
import { GERMANY_MARKET } from './germanyMarket';

describe('dev auto-play', () => {
  it('finishes Norway, then Germany at Norway’s agreed price, with careful results', () => {
    const norway = autoPlay(NORWAY_MARKET, NORWAY_CAREFUL);
    assert.equal(norway.phase, 'done');
    assert.ok(profit(NORWAY_MARKET, norway) >= 0);
    const germany = autoPlay(GERMANY_MARKET, GERMANY_CAREFUL, norway.sale.price!);
    assert.equal(germany.phase, 'done');
    assert.equal(germany.carriedCost, norway.sale.price);
    assert.equal(profit(GERMANY_MARKET, germany), 68);
  });
});
