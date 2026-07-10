import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recalcTotals } from './totals.ts';

test('単一10%明細・値引きなし', () => {
  const r = recalcTotals([{ quantity: 1, unit_price: 100_000, tax_rate: 0.1 }]);
  assert.equal(r.subtotal, 100_000);
  assert.equal(r.tax, 10_000);
  assert.equal(r.total, 110_000);
  assert.equal(r.withholding, 0); // policy 無効
  assert.equal(r.netPayable, 110_000);
});

test('数量×単価は四捨五入', () => {
  // 1.5h × 8,333 = 12499.5 → 12500
  const r = recalcTotals([{ quantity: 1.5, unit_price: 8_333, tax_rate: 0.1 }]);
  assert.equal(r.lineTotals[0], 12_500);
});

test('消費税は税率ごとに切り捨て', () => {
  // 999 * 0.1 = 99.9 → 99
  const r = recalcTotals([{ quantity: 1, unit_price: 999, tax_rate: 0.1 }]);
  assert.equal(r.tax, 99);
});

test('複数税率(10%と8%)を区分集計', () => {
  const r = recalcTotals([
    { quantity: 1, unit_price: 10_000, tax_rate: 0.1 },
    { quantity: 1, unit_price: 5_000, tax_rate: 0.08 },
  ]);
  assert.equal(r.subtotal, 15_000);
  const t10 = r.taxLines.find((t) => t.rate === 0.1)!;
  const t8 = r.taxLines.find((t) => t.rate === 0.08)!;
  assert.equal(t10.tax, 1_000);
  assert.equal(t8.tax, 400);
  assert.equal(r.tax, 1_400);
  assert.equal(r.total, 16_400);
});

test('値引きを税率グループへ按分し、残差なく合計が一致', () => {
  const r = recalcTotals(
    [
      { quantity: 1, unit_price: 10_000, tax_rate: 0.1 },
      { quantity: 1, unit_price: 5_000, tax_rate: 0.08 },
    ],
    3_000,
  );
  assert.equal(r.discount, 3_000);
  // 課税標準の合計 = subtotal - discount
  const baseSum = r.taxLines.reduce((s, t) => s + t.base, 0);
  assert.equal(baseSum, r.subtotal - r.discount);
  assert.equal(r.total, r.subtotal - r.discount + r.tax);
});

test('値引きは subtotal を超えない・負値は0にクランプ', () => {
  const over = recalcTotals([{ quantity: 1, unit_price: 1_000, tax_rate: 0.1 }], 5_000);
  assert.equal(over.discount, 1_000);
  const neg = recalcTotals([{ quantity: 1, unit_price: 1_000, tax_rate: 0.1 }], -50);
  assert.equal(neg.discount, 0);
});

test('源泉徴収: 個人ONで対象品目のみ課税', () => {
  const r = recalcTotals(
    [
      { quantity: 1, unit_price: 300_000, tax_rate: 0.1, withholding_eligible: true },
      { quantity: 1, unit_price: 50_000, tax_rate: 0.1, withholding_eligible: false }, // 実費立替など
    ],
    0,
    { enabled: true },
  );
  assert.equal(r.withholdingBase, 300_000);
  assert.equal(r.withholding, 30_630); // 300000 * 0.1021
  assert.equal(r.total, 385_000); // 350000 + 35000
  assert.equal(r.netPayable, 385_000 - 30_630);
});

test('源泉の課税標準は税抜・値引き後', () => {
  const r = recalcTotals(
    [{ quantity: 1, unit_price: 500_000, tax_rate: 0.1 }],
    100_000,
    { enabled: true },
  );
  // base = 500000 - 100000 = 400000, wh = floor(400000*0.1021)=40840
  assert.equal(r.withholdingBase, 400_000);
  assert.equal(r.withholding, 40_840);
});

test('空明細は全ゼロ', () => {
  const r = recalcTotals([]);
  assert.equal(r.subtotal, 0);
  assert.equal(r.tax, 0);
  assert.equal(r.total, 0);
  assert.equal(r.netPayable, 0);
});
