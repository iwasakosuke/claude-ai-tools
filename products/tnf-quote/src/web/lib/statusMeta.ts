/**
 * ステータスの表示メタ(色 + 日本語ラベル)。
 * 色だけに頼らず必ずラベルも出す(仕様 §6 アクセシビリティ)。
 */
import type { QuoteStatus, InvoiceStatus } from '../../types.ts';

export type Tone = 'gray' | 'blue' | 'green' | 'red' | 'amber';

export interface StatusMeta {
  label: string;
  tone: Tone;
}

export const QUOTE_STATUS_META: Record<QuoteStatus, StatusMeta> = {
  draft: { label: '下書き', tone: 'gray' },
  sent: { label: '送付済み', tone: 'blue' },
  accepted: { label: '受注', tone: 'green' },
  rejected: { label: '失注', tone: 'red' },
  expired: { label: '期限切れ', tone: 'amber' },
};

export const INVOICE_STATUS_META: Record<InvoiceStatus, StatusMeta> = {
  draft: { label: '下書き', tone: 'gray' },
  issued: { label: '発行済み', tone: 'blue' },
  paid: { label: '入金済み', tone: 'green' },
  overdue: { label: '入金遅延', tone: 'red' },
};
