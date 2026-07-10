/**
 * インメモリ Repo 実装。テストとローカル検証専用(本番は Base44 実装)。
 */

import type { Repo, BaseFields } from './repository.ts';
import type {
  Base44Base, Organization, Quote, QuoteItem, Invoice, InvoiceItem, ActivityLog,
} from '../types.ts';

let counter = 0;
const id = (p: string) => `${p}_${++counter}`;
const now = () => new Date().toISOString();

function base(createdBy = 'test'): Base44Base {
  return { id: id('x'), created_date: now(), updated_date: now(), created_by: createdBy };
}

export class MemoryRepo implements Repo {
  orgs = new Map<string, Organization>();
  quotes = new Map<string, Quote>();
  quoteItems: QuoteItem[] = [];
  invoices = new Map<string, Invoice>();
  invoiceItems: InvoiceItem[] = [];
  logs: ActivityLog[] = [];

  seedOrg(partial: Partial<Organization> & { id: string }): Organization {
    const org: Organization = {
      created_date: now(), updated_date: now(), created_by: 'test',
      name: 'テスト', is_individual: false, bank_info: '',
      quote_prefix: 'Q-', quote_seq: 1, invoice_prefix: 'INV-', invoice_seq: 1,
      default_tax_rate: 0.1, default_valid_days: 30, plan: 'solo',
      quote_count_this_month: 0, invoice_count_this_month: 0,
      ...partial,
    };
    this.orgs.set(org.id, org);
    return org;
  }

  async getOrg(orgId: string) { return req(this.orgs.get(orgId), 'org'); }

  async nextQuoteSeq(orgId: string) {
    const org = await this.getOrg(orgId);
    const seq = org.quote_seq;
    org.quote_seq += 1;
    return { prefix: org.quote_prefix, seq };
  }
  async nextInvoiceSeq(orgId: string) {
    const org = await this.getOrg(orgId);
    const seq = org.invoice_seq;
    org.invoice_seq += 1;
    return { prefix: org.invoice_prefix, seq };
  }

  async getQuote(qid: string) { return req(this.quotes.get(qid), 'quote'); }
  async listQuoteItems(quoteId: string) {
    return this.quoteItems.filter((i) => i.quote_id === quoteId).sort((a, b) => a.sort_order - b.sort_order);
  }
  async createQuote(data: Omit<Quote, BaseFields>) {
    const q = { ...base(), ...data } as Quote;
    this.quotes.set(q.id, q);
    return q;
  }
  async updateQuote(qid: string, patch: Partial<Quote>) {
    const q = { ...(await this.getQuote(qid)), ...patch, updated_date: now() };
    this.quotes.set(qid, q);
    return q;
  }
  async createQuoteItems(items: Omit<QuoteItem, BaseFields>[]) {
    const created = items.map((it) => ({ ...base(), ...it }) as QuoteItem);
    this.quoteItems.push(...created);
    return created;
  }

  async getInvoice(iid: string) { return req(this.invoices.get(iid), 'invoice'); }
  async createInvoice(data: Omit<Invoice, BaseFields>) {
    const inv = { ...base(), ...data } as Invoice;
    this.invoices.set(inv.id, inv);
    return inv;
  }
  async updateInvoice(iid: string, patch: Partial<Invoice>) {
    const inv = { ...(await this.getInvoice(iid)), ...patch, updated_date: now() };
    this.invoices.set(iid, inv);
    return inv;
  }
  async createInvoiceItems(items: Omit<InvoiceItem, BaseFields>[]) {
    const created = items.map((it) => ({ ...base(), ...it }) as InvoiceItem);
    this.invoiceItems.push(...created);
    return created;
  }
  async listOverdueCandidates() { return [...this.invoices.values()]; }
  async listExpirableQuotes() { return [...this.quotes.values()]; }

  async incrementMonthlyCounter(orgId: string, kind: 'quote' | 'invoice') {
    const org = await this.getOrg(orgId);
    if (kind === 'quote') org.quote_count_this_month += 1;
    else org.invoice_count_this_month += 1;
  }
  async log(entry: Omit<ActivityLog, BaseFields>) {
    this.logs.push({ ...base(), ...entry } as ActivityLog);
  }
}

function req<T>(v: T | undefined, what: string): T {
  if (!v) throw new Error(`not found: ${what}`);
  return v;
}
