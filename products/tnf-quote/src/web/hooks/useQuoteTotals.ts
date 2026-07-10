/**
 * 明細・値引き・源泉トグルからリアルタイム合計を計算するフック。
 * バックエンドの確定計算と同じ domain.recalcTotals を使う ——
 * 「画面の数字」と「サーバーの確定値」が一致することを保証する。
 */
import { useMemo } from 'react';
import { recalcTotals, type CalcLineItem, type TotalsResult } from '../../domain/index.ts';

export function useQuoteTotals(
  items: CalcLineItem[],
  discount: number,
  withholdingEnabled: boolean,
): TotalsResult {
  return useMemo(
    () => recalcTotals(items, discount, { enabled: withholdingEnabled }),
    [items, discount, withholdingEnabled],
  );
}
