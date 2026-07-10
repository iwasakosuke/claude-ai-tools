/**
 * 見積番号・請求番号の採番。
 *
 * 重要な設計判断:
 *   - 見積番号と請求番号は「別採番」(仕様 §2 要点)。
 *   - 実際のカウンタ更新(seq のインクリメント)はサーバー側で原子的に行う。
 *     ここは「次の seq から表示文字列を作る」純粋関数のみを提供し、
 *     フロント・バックの両方で同じ書式を保証する。
 *
 * 書式: `${prefix}${YYYYMM}-${zero-padded seq}`
 *   例: prefix="Q-", seq=7        → "Q-202607-0007"
 *       prefix="INV-", seq=125    → "INV-202607-0125"
 */

export interface NumberingConfig {
  prefix: string;
  /** 次に採番する連番(1 始まり) */
  seq: number;
  /** ゼロ埋め桁数(既定 4) */
  pad?: number;
}

export function formatDocumentNumber(config: NumberingConfig, at: Date = new Date()): string {
  const yyyymm = `${at.getFullYear()}${String(at.getMonth() + 1).padStart(2, '0')}`;
  const seqStr = String(config.seq).padStart(config.pad ?? 4, '0');
  return `${config.prefix}${yyyymm}-${seqStr}`;
}
