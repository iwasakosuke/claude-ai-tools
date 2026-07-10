import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcWithholding } from './withholding.ts';

test('0 以下は源泉なし', () => {
  assert.equal(calcWithholding(0), 0);
  assert.equal(calcWithholding(-100), 0);
});

test('100万円以下は 10.21% 切り捨て', () => {
  assert.equal(calcWithholding(100_000), 10_210); // 10210.0
  assert.equal(calcWithholding(50_000), 5_105);
  // 端数切り捨て: 12345 * 0.1021 = 1260.4... → 1260
  assert.equal(calcWithholding(12_345), 1_260);
});

test('ちょうど100万円は 102,100', () => {
  assert.equal(calcWithholding(1_000_000), 102_100);
});

test('100万円超は超過分のみ 20.42%', () => {
  // 102100 + 200000*0.2042(=40840) = 142940
  assert.equal(calcWithholding(1_200_000), 142_940);
});

test('100万円を1円超えても低率部分は102,100で確定', () => {
  // 102100 + 1*0.2042 = 102100.2042 → 切り捨て 102100
  assert.equal(calcWithholding(1_000_001), 102_100);
});
