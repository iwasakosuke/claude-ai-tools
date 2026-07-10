/**
 * リポジトリ・ポート(データアクセスの抽象)。
 *
 * なぜ抽象化するか(保守性):
 *   Base44 SDK に直接依存すると、業務ロジックが SDK なしでテストできず、
 *   将来のプラットフォーム変更にも弱くなる。そこで「必要な操作」だけを
 *   インターフェースで定義し、本番は Base44 実装、テストはインメモリ実装を差す。
 *
 * 実際の Base44 配線は src/server/base44Repository.ts(スケルトン)を参照。
 */

import type {
  Organization, Quote, QuoteItem, Invoice, InvoiceItem, ActivityLog,
} from '../types.ts';

/** org スコープ内での連番の原子的採番。Base44 側でトランザクション相当に実装する。 */
export interface Sequencer {
  /** quote_seq / invoice_seq を +1 して「採番した番号」を返す(原子的)。 */
  nextQuoteSeq(orgId: string): Promise<{ prefix: string; seq: number }>;
  nextInvoiceSeq(orgId: string): Promise<{ prefix: string; seq: number }>;
}

export interface Repo extends Sequencer {
  getOrg(orgId: string): Promise<Organization>;

  getQuote(id: string): Promise<Quote>;
  listQuoteItems(quoteId: string): Promise<QuoteItem[]>;
  createQuote(data: Omit<Quote, BaseFields>): Promise<Quote>;
  updateQuote(id: string, patch: Partial<Quote>): Promise<Quote>;
  createQuoteItems(items: Omit<QuoteItem, BaseFields>[]): Promise<QuoteItem[]>;

  getInvoice(id: string): Promise<Invoice>;
  createInvoice(data: Omit<Invoice, BaseFields>): Promise<Invoice>;
  updateInvoice(id: string, patch: Partial<Invoice>): Promise<Invoice>;
  createInvoiceItems(items: Omit<InvoiceItem, BaseFields>[]): Promise<InvoiceItem[]>;
  listOverdueCandidates(now: string): Promise<Invoice[]>;
  listExpirableQuotes(now: string): Promise<Quote[]>;

  incrementMonthlyCounter(orgId: string, kind: 'quote' | 'invoice'): Promise<void>;
  log(entry: Omit<ActivityLog, BaseFields>): Promise<void>;
}

/** Base44 が自動付与するフィールド(作成時には渡さない) */
export type BaseFields = 'id' | 'created_date' | 'updated_date' | 'created_by';

/** 月次上限。Free の壁を作る(仕様 §9)。 */
export const PLAN_LIMITS: Record<string, { quotesPerMonth: number; canInvoice: boolean; seats: number }> = {
  free: { quotesPerMonth: 3, canInvoice: false, seats: 1 },
  solo: { quotesPerMonth: Infinity, canInvoice: true, seats: 1 },
  studio: { quotesPerMonth: Infinity, canInvoice: true, seats: 5 },
  agency: { quotesPerMonth: Infinity, canInvoice: true, seats: Infinity },
};

/** 業務エラー。UI は message をそのまま出せる平易な日本語にする(仕様 §7)。 */
export class DomainError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
  }
}
