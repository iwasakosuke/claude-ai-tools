/**
 * 見積・請求の合計計算(サーバー確定ロジックの中核)。
 *
 * フロントのリアルタイム表示にも、バックエンドの確定計算にも同じ関数を使う。
 * 「表示と確定でズレない」ことが保守性・信頼性の要。
 *
 * 計算の流れ:
 *   1. 各明細 line_total = round(数量 × 単価)  ※税抜
 *   2. subtotal = Σ line_total
 *   3. 値引き(discount)は subtotal 全体に対する金額。税率グループへ按分する。
 *   4. 税率グループごとに (課税標準 = グループ税抜 − 按分値引き) × 税率 を切り捨て → 税額
 *   5. tax = Σ グループ税額
 *   6. 源泉徴収 = calcWithholding(対象品目の税抜・値引き後合計)  ※policy.enabled 時のみ
 *   7. total(源泉控除前) = (subtotal − discount) + tax
 *   8. net_payable(差引支払額) = total − withholding
 */

import { roundYen, floorYen } from './money.ts';
import { calcWithholding } from './withholding.ts';

export interface CalcLineItem {
  quantity: number;
  /** 税抜単価(円) */
  unit_price: number;
  /** 例: 0.10, 0.08 */
  tax_rate: number;
  /** 源泉徴収の対象品目か。既定 true(デザイン/制作報酬を想定) */
  withholding_eligible?: boolean;
}

export interface WithholdingPolicy {
  /** 個人事業主 かつ 請求画面のトグルON のとき true */
  enabled: boolean;
}

export interface TaxLine {
  rate: number;
  /** 税抜・値引き後の課税標準 */
  base: number;
  /** 消費税額(税率ごとに切り捨て) */
  tax: number;
}

export interface TotalsResult {
  lineTotals: number[];
  subtotal: number;
  discount: number;
  taxLines: TaxLine[];
  tax: number;
  withholdingBase: number;
  withholding: number;
  /** 源泉控除前の請求総額 */
  total: number;
  /** 差引支払額(源泉控除後) */
  netPayable: number;
}

/**
 * 明細と値引きから全合計を計算する。
 * @param items 明細
 * @param discountInput 値引き額(円)。負値は 0、subtotal 超過は subtotal にクランプ。
 * @param withholding 源泉徴収ポリシー(既定: 無効)
 */
export function recalcTotals(
  items: CalcLineItem[],
  discountInput = 0,
  withholding: WithholdingPolicy = { enabled: false },
): TotalsResult {
  const lineTotals = items.map((it) => roundYen(it.quantity * it.unit_price));
  const subtotal = lineTotals.reduce((a, b) => a + b, 0);

  const discount = Math.min(Math.max(Math.round(discountInput), 0), subtotal);

  // 税率グループごとに税抜合計を集計
  const baseByRate = new Map<number, number>();
  items.forEach((it, i) => {
    baseByRate.set(it.tax_rate, (baseByRate.get(it.tax_rate) ?? 0) + lineTotals[i]);
  });

  // 値引きを税率グループへ比例按分。丸め残差は最終グループで吸収し Σ = discount を保証。
  const rates = [...baseByRate.keys()];
  const discountByRate = new Map<number, number>();
  let allocated = 0;
  rates.forEach((rate, idx) => {
    const groupBase = baseByRate.get(rate)!;
    let d: number;
    if (idx === rates.length - 1) {
      d = discount - allocated; // 残差吸収
    } else {
      d = subtotal > 0 ? roundYen((discount * groupBase) / subtotal) : 0;
      allocated += d;
    }
    discountByRate.set(rate, d);
  });

  const taxLines: TaxLine[] = rates
    .map((rate) => {
      const base = baseByRate.get(rate)! - discountByRate.get(rate)!;
      const tax = floorYen(base * rate);
      return { rate, base, tax };
    })
    .sort((a, b) => b.rate - a.rate);

  const tax = taxLines.reduce((a, t) => a + t.tax, 0);

  // 源泉徴収の課税標準 = 対象品目の税抜・値引き後合計
  const eligibleBase = items.reduce(
    (sum, it, i) => (it.withholding_eligible !== false ? sum + lineTotals[i] : sum),
    0,
  );
  const eligibleDiscount =
    subtotal > 0 ? roundYen((discount * eligibleBase) / subtotal) : 0;
  const withholdingBase = Math.max(eligibleBase - eligibleDiscount, 0);
  const wh = withholding.enabled ? calcWithholding(withholdingBase) : 0;

  const total = subtotal - discount + tax;
  const netPayable = total - wh;

  return {
    lineTotals,
    subtotal,
    discount,
    taxLines,
    tax,
    withholdingBase,
    withholding: wh,
    total,
    netPayable,
  };
}
