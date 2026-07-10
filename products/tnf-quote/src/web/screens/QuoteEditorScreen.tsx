import { useState } from 'react';
import { LineItemEditor, type EditableItem } from '../components/LineItemEditor.tsx';
import { MoneySummary } from '../components/MoneySummary.tsx';
import { useQuoteTotals } from '../hooks/useQuoteTotals.ts';
import { PRODUCTION_PRESETS } from '../lib/presets.ts';
import { yen } from '../lib/format.ts';

export interface QuoteDraftInput {
  title: string;
  customerId: string;
  items: EditableItem[];
  discount: number;
  validUntil?: string;
  notes?: string;
}

interface Props {
  /** 個人事業主か(源泉トグルの表示を切り替え) */
  isIndividual: boolean;
  initial?: Partial<QuoteDraftInput>;
  /** 保存(下書き)。実接続では createQuote backend function を呼ぶ。 */
  onSaveDraft: (input: QuoteDraftInput & { withholdingEnabled: boolean }) => Promise<void>;
}

const FIRST_ROW: EditableItem = {
  name: '', quantity: 1, unit_price: 0, tax_rate: 0.1, withholding_eligible: true,
};

/**
 * 見積作成・編集画面。リアルタイム合計 + 空欄バリデーション(仕様 §7)。
 * 金額・番号の確定はサーバー(createQuote)。ここはドラフトを組み立てる責務のみ。
 */
export function QuoteEditorScreen({ isIndividual, initial, onSaveDraft }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [items, setItems] = useState<EditableItem[]>(initial?.items ?? [{ ...FIRST_ROW }]);
  const [discount, setDiscount] = useState(initial?.discount ?? 0);
  const [withholdingEnabled, setWithholdingEnabled] = useState(isIndividual);
  const [saving, setSaving] = useState(false);

  const totals = useQuoteTotals(items, discount, withholdingEnabled);

  // 発行・保存を無効化する条件(§7: 顧客/明細が空)
  const errors: string[] = [];
  if (!title.trim()) errors.push('件名を入力してください。');
  if (!items.some((it) => it.name.trim() && it.unit_price > 0)) {
    errors.push('金額のある明細を1行以上入力してください。');
  }
  const canSave = errors.length === 0 && !saving;

  const addPreset = (key: string) => {
    const preset = PRODUCTION_PRESETS.find((p) => p.key === key);
    if (!preset) return;
    const next = [...items];
    // 空の初期行があれば置き換え、なければ追加
    const emptyIdx = next.findIndex((it) => !it.name.trim() && it.unit_price === 0);
    if (emptyIdx >= 0) next[emptyIdx] = { ...preset.item };
    else next.push({ ...preset.item });
    setItems(next);
  };

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSaveDraft({
        title, customerId: initial?.customerId ?? '', items, discount,
        validUntil: initial?.validUntil, notes: initial?.notes, withholdingEnabled,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="editor">
      <header className="editor__head">
        <input
          className="input input--title"
          placeholder="件名(例: コーポレートサイト制作)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </header>

      <section className="editor__presets">
        <span className="editor__presets-label">制作テンプレ:</span>
        {PRODUCTION_PRESETS.map((p) => (
          <button key={p.key} type="button" className="btn btn--chip" onClick={() => addPreset(p.key)}>
            + {p.label}
          </button>
        ))}
      </section>

      <LineItemEditor items={items} onChange={setItems} showWithholdingColumn={withholdingEnabled} />

      <div className="editor__adjust">
        <label className="field">
          <span>値引き(税抜)</span>
          <input
            className="input input--num" type="number" min={0} step="1000"
            value={discount}
            onChange={(e) => setDiscount(Math.max(0, Math.round(Number(e.target.value))))}
          />
        </label>
        {isIndividual && (
          <label className="field field--check">
            <input
              type="checkbox"
              checked={withholdingEnabled}
              onChange={(e) => setWithholdingEnabled(e.target.checked)}
            />
            <span>源泉徴収を差し引く(個人発行の報酬)</span>
          </label>
        )}
      </div>

      <MoneySummary totals={totals} showWithholding={withholdingEnabled} />

      {errors.length > 0 && (
        <ul className="editor__errors" role="alert">
          {errors.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}

      <footer className="editor__foot">
        <span className="editor__hint">合計 {yen(totals.total)}(自動保存されます)</span>
        <button type="button" className="btn btn--primary" onClick={handleSave} disabled={!canSave}>
          {saving ? '保存中…' : '下書きを保存'}
        </button>
      </footer>
    </div>
  );
}
