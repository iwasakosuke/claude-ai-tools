import type { TotalsResult } from '../../domain/index.ts';
import { yen, taxRateLabel } from '../lib/format.ts';

interface Props {
  totals: TotalsResult;
  /** 源泉徴収の行を出すか(個人 & トグルON のとき) */
  showWithholding: boolean;
}

/**
 * 金額サマリー(小計・税率別消費税・源泉△・差引支払額)。
 * 明細下に固定表示する想定。差引支払額を最も強調する。
 */
export function MoneySummary({ totals, showWithholding }: Props) {
  return (
    <dl className="money">
      <div className="money__row">
        <dt>小計(税抜)</dt>
        <dd>{yen(totals.subtotal)}</dd>
      </div>

      {totals.discount > 0 && (
        <div className="money__row money__row--muted">
          <dt>値引き</dt>
          <dd>△{yen(totals.discount)}</dd>
        </div>
      )}

      {totals.taxLines.map((t) => (
        <div className="money__row money__row--muted" key={t.rate}>
          <dt>消費税 {taxRateLabel(t.rate)}(対象 {yen(t.base)})</dt>
          <dd>{yen(t.tax)}</dd>
        </div>
      ))}

      <div className="money__row">
        <dt>請求総額</dt>
        <dd>{yen(totals.total)}</dd>
      </div>

      {showWithholding && totals.withholding > 0 && (
        <div className="money__row money__row--withholding">
          <dt>源泉徴収税額</dt>
          <dd>△{yen(totals.withholding)}</dd>
        </div>
      )}

      {showWithholding && totals.withholding > 0 && (
        <div className="money__row money__row--total">
          <dt>差引支払額</dt>
          <dd>{yen(totals.netPayable)}</dd>
        </div>
      )}
    </dl>
  );
}
