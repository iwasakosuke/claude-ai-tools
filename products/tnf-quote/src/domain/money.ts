/**
 * 金額計算の丸め規則を 1 か所に集約する。
 *
 * 設計判断(仕様が沈黙している箇所は【設計判断】として明示):
 * - 金額はすべて円・整数で扱う。小数円は存在しない。
 * - 明細金額(数量×単価)は四捨五入。
 * - 消費税は「税率ごとに 1 回だけ」切り捨て(適格請求書等保存方式の要件を満たす)。
 * - 源泉徴収税額は切り捨て(国税通則法の端数処理に準拠)。
 *
 * すべて正の金額を前提とする。浮動小数点誤差を打ち消すため微小な EPS を足す。
 */

const EPS = 1e-6;

/** 四捨五入(円)。明細行の金額などに使う。 */
export function roundYen(value: number): number {
  return Math.round(value + EPS);
}

/** 切り捨て(円)。消費税・源泉徴収税額に使う。 */
export function floorYen(value: number): number {
  return Math.floor(value + EPS);
}

/** 3 桁区切り文字列。表示専用(計算には使わない)。 */
export function formatYen(value: number): string {
  return value.toLocaleString('ja-JP');
}
