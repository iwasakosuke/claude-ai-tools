/**
 * 請求書ドラフト生成の共通コア(convertQuoteToInvoice と createInvoice が共有)。
 *
 * 源泉徴収の既定:
 *   org.is_individual が true なら既定ON。請求画面のトグルで明示的に上書き可(仕様 §7)。
 *
 * 分割請求(着手金/残金)の設計判断:
 *   各明細の line_total を比率で分割する。final = full − deposit を「line_total 単位」で
 *   計算するため、deposit + final は元見積と必ず一致する。税・源泉は請求書ごとに
 *   1 回丸めるため、full 1枚と deposit+final 2枚で税額が最大1円ずれることがあるが、
 *   各請求書はそれぞれ独立した適格請求書として正しく丸められている。
 */

import { recalcTotals, roundYen, type CalcLineItem } from '../../domain/index.ts';
import type { BillingType, InvoiceItem, Organization } from '../../types.ts';

export interface SourceItem extends CalcLineItem {
  name: string;
  description?: string;
  /** 分割の基準に使う税抜金額(見積の line_total 相当) */
  line_total: number;
}

export interface BuildInvoiceInput {
  org: Organization;
  billingType: BillingType;
  /** deposit/final の分割比率(0〜1)。deposit のときの請求割合。既定 0.5 */
  depositRatio?: number;
  discount?: number;
  /** 源泉トグルの明示指定。未指定なら org.is_individual に従う */
  withholdingEnabled?: boolean;
  items: SourceItem[];
}

export interface InvoiceDraft {
  subtotal: number;
  discount: number;
  tax: number;
  withholding_tax: number;
  total: number;
  net_payable: number;
  items: Omit<InvoiceItem, 'id' | 'created_date' | 'updated_date' | 'created_by' | 'invoice_id'>[];
}

export function buildInvoiceDraft(input: BuildInvoiceInput): InvoiceDraft {
  const ratio = input.depositRatio ?? 0.5;
  const withholdingEnabled = input.withholdingEnabled ?? input.org.is_individual;

  // 各明細の請求金額(税抜)を billing_type に応じて算出
  const billedItems = input.items.map((it) => {
    const billed = portionOf(it.line_total, input.billingType, ratio);
    return {
      name: decorateName(it.name, input.billingType, ratio),
      description: it.description,
      quantity: 1,
      unit_price: billed, // 分割後の金額を単価1個ぶんとして持つ
      tax_rate: it.tax_rate,
      withholding_eligible: it.withholding_eligible !== false,
    };
  });

  const discount = portionOf(input.discount ?? 0, input.billingType, ratio);

  const totals = recalcTotals(
    billedItems as CalcLineItem[],
    discount,
    { enabled: withholdingEnabled },
  );

  return {
    subtotal: totals.subtotal,
    discount: totals.discount,
    tax: totals.tax,
    withholding_tax: totals.withholding,
    total: totals.total,
    net_payable: totals.netPayable,
    items: billedItems.map((it, i) => ({
      name: it.name,
      description: it.description,
      quantity: 1,
      unit_price: it.unit_price,
      tax_rate: it.tax_rate,
      line_total: totals.lineTotals[i],
      sort_order: i,
      withholding_eligible: it.withholding_eligible,
    })),
  };
}

/** 全額/着手金/残金 に応じた金額。final は full−deposit で一致を保証。 */
function portionOf(full: number, type: BillingType, ratio: number): number {
  if (type === 'full') return full;
  const deposit = roundYen(full * ratio);
  return type === 'deposit' ? deposit : full - deposit;
}

function decorateName(name: string, type: BillingType, ratio: number): string {
  if (type === 'deposit') return `${name}(着手金 ${Math.round(ratio * 100)}%)`;
  if (type === 'final') return `${name}(残金)`;
  return name;
}
