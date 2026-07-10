import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MemoryRepo } from '../memoryRepo.ts';
import { createQuote } from './createQuote.ts';
import { markQuoteDecision } from './markQuoteDecision.ts';
import { markQuoteSent } from './markQuoteSent.ts';
import { convertQuoteToInvoice } from './convertQuoteToInvoice.ts';
import { recordPayment } from './recordPayment.ts';
import { DomainError } from '../repository.ts';

function setup(orgPatch = {}) {
  const repo = new MemoryRepo();
  const org = repo.seedOrg({ id: 'org1', plan: 'solo', ...orgPatch });
  return { repo, org };
}

const items = [
  { name: 'サイト制作費', quantity: 1, unit_price: 400_000, tax_rate: 0.1 },
  { name: 'ディレクション', quantity: 1, unit_price: 100_000, tax_rate: 0.1 },
];

test('createQuote: 採番・合計・下書き', async () => {
  const { repo } = setup();
  const q = await createQuote(repo, {
    orgId: 'org1', customerId: 'c1', title: 'コーポレートサイト',
    ownerId: 'u1', items,
  });
  assert.equal(q.quote_number.startsWith('Q-'), true);
  assert.equal(q.subtotal, 500_000);
  assert.equal(q.tax, 50_000);
  assert.equal(q.total, 550_000);
  assert.equal(q.status, 'draft');
});

test('Free プランは見積4件目で上限エラー', async () => {
  const { repo } = setup({ plan: 'free', quote_count_this_month: 3 });
  await assert.rejects(
    () => createQuote(repo, { orgId: 'org1', customerId: 'c1', title: 't', ownerId: 'u1', items }),
    (e: unknown) => e instanceof DomainError && e.code === 'PLAN_LIMIT',
  );
});

test('未受注の見積は請求書化できない', async () => {
  const { repo } = setup();
  const q = await createQuote(repo, { orgId: 'org1', customerId: 'c1', title: 't', ownerId: 'u1', items });
  await assert.rejects(
    () => convertQuoteToInvoice(repo, { quoteId: q.id, billingType: 'full', actorId: 'u1' }),
    (e: unknown) => e instanceof DomainError && e.code === 'NOT_ACCEPTED',
  );
});

test('着手金50% + 残金 = 全額(元見積と一致)', async () => {
  const { repo } = setup();
  const q = await createQuote(repo, { orgId: 'org1', customerId: 'c1', title: 't', ownerId: 'u1', items });
  await markQuoteSent(repo, { quoteId: q.id, actorId: 'u1' });
  await markQuoteDecision(repo, { quoteId: q.id, decision: 'accepted', actorId: 'u1' });

  const deposit = await convertQuoteToInvoice(repo, { quoteId: q.id, billingType: 'deposit', depositRatio: 0.5, actorId: 'u1' });
  const final = await convertQuoteToInvoice(repo, { quoteId: q.id, billingType: 'final', depositRatio: 0.5, actorId: 'u1' });

  assert.equal(deposit.subtotal + final.subtotal, q.subtotal);
  assert.equal(deposit.subtotal, 250_000);
  assert.equal(final.subtotal, 250_000);
  // 請求番号は見積とは別採番
  assert.equal(deposit.invoice_number.startsWith('INV-'), true);
});

test('個人事業主の請求は源泉徴収が自動で乗る', async () => {
  const { repo } = setup({ is_individual: true });
  const q = await createQuote(repo, { orgId: 'org1', customerId: 'c1', title: 't', ownerId: 'u1', items });
  await markQuoteSent(repo, { quoteId: q.id, actorId: 'u1' });
  await markQuoteDecision(repo, { quoteId: q.id, decision: 'accepted', actorId: 'u1' });
  const inv = await convertQuoteToInvoice(repo, { quoteId: q.id, billingType: 'full', actorId: 'u1' });

  // base 500,000 → 51,050、total 550,000、net 498,950
  assert.equal(inv.withholding_tax, 51_050);
  assert.equal(inv.total, 550_000);
  assert.equal(inv.net_payable, 498_950);
});

test('recordPayment: 一部入金は paid にせず残額を返す→完済で paid', async () => {
  const { repo } = setup();
  const q = await createQuote(repo, { orgId: 'org1', customerId: 'c1', title: 't', ownerId: 'u1', items });
  await markQuoteSent(repo, { quoteId: q.id, actorId: 'u1' });
  await markQuoteDecision(repo, { quoteId: q.id, decision: 'accepted', actorId: 'u1' });
  const inv = await convertQuoteToInvoice(repo, { quoteId: q.id, billingType: 'full', actorId: 'u1' });
  await repo.updateInvoice(inv.id, { status: 'issued' });

  const p1 = await recordPayment(repo, { invoiceId: inv.id, amount: 300_000, paidAt: '2026-07-10', actorId: 'u1' });
  assert.equal(p1.fullyPaid, false);
  assert.equal(p1.remaining, 250_000);
  assert.equal(p1.invoice.status, 'issued');

  const p2 = await recordPayment(repo, { invoiceId: inv.id, amount: 250_000, paidAt: '2026-07-20', actorId: 'u1' });
  assert.equal(p2.fullyPaid, true);
  assert.equal(p2.invoice.status, 'paid');
});
