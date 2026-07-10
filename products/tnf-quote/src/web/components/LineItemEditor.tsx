import { useRef } from 'react';
import type { CalcLineItem } from '../../domain/index.ts';
import { roundYen } from '../../domain/index.ts';
import { yen } from '../lib/format.ts';

/** 編集中の明細行(表示名を含む) */
export interface EditableItem extends CalcLineItem {
  name: string;
  description?: string;
}

interface Props {
  items: EditableItem[];
  onChange: (items: EditableItem[]) => void;
  /** 個人事業主のとき源泉対象トグル列を出す */
  showWithholdingColumn: boolean;
}

const BLANK: EditableItem = {
  name: '', quantity: 1, unit_price: 0, tax_rate: 0.1, withholding_eligible: true,
};

/**
 * 明細エディタ。キーボードで連続入力できるよう、最終行の単価で Enter すると
 * 新しい行を追加する(仕様 §5「明細はキーボードで連続入力」)。
 */
export function LineItemEditor({ items, onChange, showWithholdingColumn }: Props) {
  const lastPriceRef = useRef<HTMLInputElement>(null);

  const update = (i: number, patch: Partial<EditableItem>) => {
    onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  };
  const addRow = () => onChange([...items, { ...BLANK }]);
  const removeRow = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <table className="items">
      <thead>
        <tr>
          <th className="items__name">品目</th>
          <th className="items__num">数量</th>
          <th className="items__num">単価(税抜)</th>
          <th className="items__num">税率</th>
          {showWithholdingColumn && <th className="items__wh">源泉対象</th>}
          <th className="items__num">金額</th>
          <th aria-label="操作" />
        </tr>
      </thead>
      <tbody>
        {items.map((it, i) => {
          const isLast = i === items.length - 1;
          const lineTotal = roundYen(it.quantity * it.unit_price);
          return (
            <tr key={i}>
              <td>
                <input
                  className="input"
                  value={it.name}
                  placeholder="サイト制作費 など"
                  onChange={(e) => update(i, { name: e.target.value })}
                />
              </td>
              <td>
                <input
                  className="input input--num" type="number" min={0} step="0.5"
                  value={it.quantity}
                  onChange={(e) => update(i, { quantity: Number(e.target.value) })}
                />
              </td>
              <td>
                <input
                  className="input input--num" type="number" min={0} step="1000"
                  value={it.unit_price}
                  ref={isLast ? lastPriceRef : undefined}
                  onChange={(e) => update(i, { unit_price: Math.round(Number(e.target.value)) })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && isLast) {
                      e.preventDefault();
                      addRow();
                    }
                  }}
                />
              </td>
              <td>
                <select
                  className="input input--num"
                  value={it.tax_rate}
                  onChange={(e) => update(i, { tax_rate: Number(e.target.value) })}
                >
                  <option value={0.1}>10%</option>
                  <option value={0.08}>8%</option>
                  <option value={0}>非課税</option>
                </select>
              </td>
              {showWithholdingColumn && (
                <td className="items__wh">
                  <input
                    type="checkbox"
                    checked={it.withholding_eligible !== false}
                    onChange={(e) => update(i, { withholding_eligible: e.target.checked })}
                    aria-label="源泉徴収の対象"
                  />
                </td>
              )}
              <td className="items__num items__total">{yen(lineTotal)}</td>
              <td>
                <button
                  type="button" className="btn btn--icon"
                  onClick={() => removeRow(i)}
                  disabled={items.length === 1}
                  aria-label="この行を削除"
                >
                  ✕
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={showWithholdingColumn ? 7 : 6}>
            <button type="button" className="btn btn--ghost" onClick={addRow}>
              + 明細を追加
            </button>
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
