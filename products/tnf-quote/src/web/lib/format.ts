/** 表示用フォーマッタ(計算には domain/money を使うこと)。 */

export function yen(value: number): string {
  return `¥${value.toLocaleString('ja-JP')}`;
}

/** 源泉徴収の差引は △ 表示(仕様 §6)。 */
export function yenSigned(value: number, negative = false): string {
  return negative ? `△¥${value.toLocaleString('ja-JP')}` : yen(value);
}

export function taxRateLabel(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}
