/**
 * 源泉徴収の計算。
 *
 * デザイン・制作報酬を個人が請求する場合、支払者は源泉徴収義務を負う。
 * 税率:
 *   - 支払金額 100万円以下の部分 … 10.21%
 *   - 100万円を超える部分       … 20.42%
 *
 * 課税標準(base)について【設計判断】:
 *   請求書で消費税額を税率ごとに区分表示するため、源泉徴収は
 *   「税抜(本体)金額」を対象とする(国税庁の取扱いに準拠)。
 *   よって base には値引き後・税抜の対象品目合計を渡す。
 *
 * 端数は切り捨て。
 */

import { floorYen } from './money.ts';

export const WITHHOLDING_THRESHOLD = 1_000_000;
export const WITHHOLDING_RATE_LOW = 0.1021;
export const WITHHOLDING_RATE_HIGH = 0.2042;

/**
 * 源泉徴収税額を返す。
 * @param base 税抜・値引き後の「源泉徴収対象品目」合計(円)
 */
export function calcWithholding(base: number): number {
  if (base <= 0) return 0;

  if (base <= WITHHOLDING_THRESHOLD) {
    return floorYen(base * WITHHOLDING_RATE_LOW);
  }

  const lowPart = WITHHOLDING_THRESHOLD * WITHHOLDING_RATE_LOW;
  const highPart = (base - WITHHOLDING_THRESHOLD) * WITHHOLDING_RATE_HIGH;
  return floorYen(lowPart + highPart);
}
