import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDocumentNumber } from './numbering.ts';

const at = new Date(2026, 6, 3); // 2026-07-03(月は0始まり)

test('見積番号の書式', () => {
  assert.equal(formatDocumentNumber({ prefix: 'Q-', seq: 7 }, at), 'Q-202607-0007');
});

test('請求番号は別 prefix・別 seq', () => {
  assert.equal(formatDocumentNumber({ prefix: 'INV-', seq: 125 }, at), 'INV-202607-0125');
});

test('ゼロ埋め桁数を変更できる', () => {
  assert.equal(formatDocumentNumber({ prefix: 'Q', seq: 3, pad: 6 }, at), 'Q202607-000003');
});
