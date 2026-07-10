/**
 * convertQuoteToInvoice — 受注見積から請求書を生成。
 * billing_type で 全額/着手金/残金 を指定。請求番号は別採番。
 * Invoice は Quote から複製し以後は独立(仕様 §2 要点)。
 */

import { canConvertToInvoice, formatDocumentNumber } from '../../domain/index.ts';
import { buildInvoiceDraft } from './_invoiceCore.ts';
import { DomainError, PLAN_LIMITS, type Repo } from '../repository.ts';
import type { BillingType, Invoice } from '../../types.ts';

export interface ConvertInput {
  quoteId: string;
  billingType: BillingType;
  depositRatio?: number;
  withholdingEnabled?: boolean;
  dueDate?: string;
  actorId: string;
}

export async function convertQuoteToInvoice(repo: Repo, input: ConvertInput): Promise<Invoice> {
  const quote = await repo.getQuote(input.quoteId);
  const org = await repo.getOrg(quote.org_id);

  if (!PLAN_LIMITS[org.plan].canInvoice) {
    throw new DomainError('PLAN_LIMIT', '請求書の発行は Solo 以上のプランで利用できます。');
  }
  if (!canConvertToInvoice(quote.status)) {
    throw new DomainError('NOT_ACCEPTED', '受注済みの見積のみ請求書に変換できます。まず受注マークを付けてください。');
  }

  const quoteItems = await repo.listQuoteItems(quote.id);
  const draft = buildInvoiceDraft({
    org,
    billingType: input.billingType,
    depositRatio: input.depositRatio,
    discount: quote.discount,
    withholdingEnabled: input.withholdingEnabled,
    items: quoteItems.map((qi) => ({
      name: qi.name, description: qi.description,
      quantity: qi.quantity, unit_price: qi.unit_price, tax_rate: qi.tax_rate,
      withholding_eligible: qi.withholding_eligible, line_total: qi.line_total,
    })),
  });

  const { prefix, seq } = await repo.nextInvoiceSeq(quote.org_id);
  const invoice = await repo.createInvoice({
    org_id: quote.org_id,
    customer_id: quote.customer_id,
    quote_id: quote.id,
    invoice_number: formatDocumentNumber({ prefix, seq }),
    title: titleFor(quote.title, input.billingType),
    billing_type: input.billingType,
    status: 'draft',
    subtotal: draft.subtotal,
    discount: draft.discount,
    tax: draft.tax,
    withholding_tax: draft.withholding_tax,
    total: draft.total,
    net_payable: draft.net_payable,
    due_date: input.dueDate,
    paid_amount: 0,
  });

  await repo.createInvoiceItems(draft.items.map((it) => ({ ...it, invoice_id: invoice.id })));
  await repo.log({
    org_id: quote.org_id, actor_id: input.actorId, target: 'invoice',
    action: 'created_from_quote',
    meta: { invoice_id: invoice.id, quote_id: quote.id, billing_type: input.billingType },
  });
  return invoice;
}

function titleFor(base: string, type: BillingType): string {
  if (type === 'deposit') return `${base}(着手金)`;
  if (type === 'final') return `${base}(残金)`;
  return base;
}
