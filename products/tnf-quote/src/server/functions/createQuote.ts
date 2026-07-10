/**
 * createQuote — 見積番号採番 + 合計計算 + 月次上限チェック。
 *
 * Base44 の backend function から呼ぶ純粋な業務ハンドラ。
 * I/O は Repo 経由、計算は domain 経由。ここには丸め規則や税ロジックを書かない。
 */

import { recalcTotals, formatDocumentNumber, type CalcLineItem } from '../../domain/index.ts';
import { DomainError, PLAN_LIMITS, type Repo } from '../repository.ts';
import type { Quote } from '../../types.ts';

export interface CreateQuoteInput {
  orgId: string;
  customerId: string;
  title: string;
  ownerId: string;
  items: (CalcLineItem & { name: string; description?: string })[];
  discount?: number;
  validUntil?: string;
  notes?: string;
}

export async function createQuote(repo: Repo, input: CreateQuoteInput): Promise<Quote> {
  const org = await repo.getOrg(input.orgId);

  // 月次上限チェック(Free は月3件)
  const limit = PLAN_LIMITS[org.plan].quotesPerMonth;
  if (org.quote_count_this_month >= limit) {
    throw new DomainError(
      'PLAN_LIMIT',
      '今月の見積上限に達しました。プランを変更すると解除できます。',
    );
  }

  const totals = recalcTotals(input.items, input.discount ?? 0);
  const { prefix, seq } = await repo.nextQuoteSeq(input.orgId);
  const quoteNumber = formatDocumentNumber({ prefix, seq });

  const quote = await repo.createQuote({
    org_id: input.orgId,
    customer_id: input.customerId,
    quote_number: quoteNumber,
    title: input.title,
    status: 'draft',
    subtotal: totals.subtotal,
    discount: totals.discount,
    tax: totals.tax,
    total: totals.total,
    valid_until: input.validUntil ?? addDays(new Date(), org.default_valid_days),
    notes: input.notes,
    owner_id: input.ownerId,
  });

  await repo.createQuoteItems(
    input.items.map((it, i) => ({
      quote_id: quote.id,
      name: it.name,
      description: it.description,
      quantity: it.quantity,
      unit_price: it.unit_price,
      tax_rate: it.tax_rate,
      line_total: totals.lineTotals[i],
      sort_order: i,
      withholding_eligible: it.withholding_eligible !== false,
    })),
  );

  await repo.incrementMonthlyCounter(input.orgId, 'quote');
  await repo.log({
    org_id: input.orgId, actor_id: input.ownerId, target: 'quote',
    action: 'created', meta: { quote_id: quote.id, total: totals.total },
  });

  return quote;
}

function addDays(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
