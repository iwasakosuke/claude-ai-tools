/**
 * Base44 SDK を使った Repo 実装のスケルトン。
 *
 * ⚠️ これは配線の雛形。Base44 の backend function 実行環境(Deno)で、
 * 実際の SDK 形に合わせて調整すること。ドメイン/関数側は一切変更不要 ——
 * それがこの抽象化の狙い(保守性)。
 *
 * 採番の原子性が最重要:
 *   quote_seq / invoice_seq の +1 は「読んで増やして書く」の競合で番号重複が起きうる。
 *   Base44 に条件付き更新(compare-and-set)があればそれを使う。無ければ
 *   採番専用の backend function 内でリトライ付き楽観ロックにする。ここは
 *   本番実装時に必ず結合テストで番号重複が出ないことを確認する。
 */

import type { Repo, BaseFields } from './repository.ts';
import type { Quote, QuoteItem, Invoice, InvoiceItem, Organization, ActivityLog } from '../types.ts';

// Base44 backend function 内では、SDK クライアントが渡される想定。
// import { createClientFromRequest } from '@base44/sdk';
type Base44Client = {
  entities: {
    Organization: EntityApi<Organization>;
    Quote: EntityApi<Quote>;
    QuoteItem: EntityApi<QuoteItem>;
    Invoice: EntityApi<Invoice>;
    InvoiceItem: EntityApi<InvoiceItem>;
    ActivityLog: EntityApi<ActivityLog>;
  };
};
interface EntityApi<T> {
  get(id: string): Promise<T>;
  filter(query: Partial<T>): Promise<T[]>;
  create(data: Omit<T, BaseFields>): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T>;
}

export function createBase44Repo(client: Base44Client): Repo {
  const E = client.entities;
  return {
    getOrg: (id) => E.Organization.get(id),

    // 採番: 本番では compare-and-set か採番用 function に置換すること(上の注意参照)
    async nextQuoteSeq(orgId) {
      const org = await E.Organization.get(orgId);
      await E.Organization.update(orgId, { quote_seq: org.quote_seq + 1 } as Partial<Organization>);
      return { prefix: org.quote_prefix, seq: org.quote_seq };
    },
    async nextInvoiceSeq(orgId) {
      const org = await E.Organization.get(orgId);
      await E.Organization.update(orgId, { invoice_seq: org.invoice_seq + 1 } as Partial<Organization>);
      return { prefix: org.invoice_prefix, seq: org.invoice_seq };
    },

    getQuote: (id) => E.Quote.get(id),
    listQuoteItems: (quoteId) => E.QuoteItem.filter({ quote_id: quoteId } as Partial<QuoteItem>),
    createQuote: (data) => E.Quote.create(data),
    updateQuote: (id, patch) => E.Quote.update(id, patch),
    createQuoteItems: (items) => Promise.all(items.map((i) => E.QuoteItem.create(i))),

    getInvoice: (id) => E.Invoice.get(id),
    createInvoice: (data) => E.Invoice.create(data),
    updateInvoice: (id, patch) => E.Invoice.update(id, patch),
    createInvoiceItems: (items) => Promise.all(items.map((i) => E.InvoiceItem.create(i))),
    listOverdueCandidates: () => E.Invoice.filter({ status: 'issued' } as Partial<Invoice>),
    listExpirableQuotes: () => E.Quote.filter({ status: 'sent' } as Partial<Quote>),

    async incrementMonthlyCounter(orgId, kind) {
      const org = await E.Organization.get(orgId);
      const patch = kind === 'quote'
        ? { quote_count_this_month: org.quote_count_this_month + 1 }
        : { invoice_count_this_month: org.invoice_count_this_month + 1 };
      await E.Organization.update(orgId, patch as Partial<Organization>);
    },
    async log(entry) { await E.ActivityLog.create(entry); },
  };
}
