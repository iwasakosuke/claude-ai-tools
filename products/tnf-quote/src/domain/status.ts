/**
 * ステータス遷移ルール(見積・請求)。
 *
 * 不正な遷移をここで一元的に弾く。UI のボタン活性/非活性も、
 * サーバーの検証も、この表を唯一の真実として参照する。
 */

import type { QuoteStatus, InvoiceStatus } from '../types.ts';

const QUOTE_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  draft: ['sent'],
  sent: ['accepted', 'rejected', 'expired'],
  accepted: [], // 受注後は変更不可(請求書化は別フロー)
  rejected: [],
  expired: ['sent'], // 期限切れは再送で復活可
};

const INVOICE_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  draft: ['issued'],
  issued: ['paid', 'overdue'],
  overdue: ['paid'], // 遅延後の入金で解消
  paid: [],
};

export function canTransitionQuote(from: QuoteStatus, to: QuoteStatus): boolean {
  return QUOTE_TRANSITIONS[from].includes(to);
}

export function canTransitionInvoice(from: InvoiceStatus, to: InvoiceStatus): boolean {
  return INVOICE_TRANSITIONS[from].includes(to);
}

/** 発行済み(発行後)の請求書は明細編集不可 → 複製フローへ */
export function isInvoiceEditable(status: InvoiceStatus): boolean {
  return status === 'draft';
}

/** 見積が請求書化できるのは受注済みのみ */
export function canConvertToInvoice(status: QuoteStatus): boolean {
  return status === 'accepted';
}
