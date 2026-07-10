/**
 * recordPayment — 入金日・入金額を記録し消込。
 *
 * - 入金額 >= 請求額(net_payable)なら paid、paid_at 記録。
 * - 入金額 < 請求額 は一部入金として累積し、paid にはしない(仕様 §7)。
 * - 冪等性は呼び出し側(Base44 function)でリクエストIDにより担保する想定。
 */

import { canTransitionInvoice } from '../../domain/index.ts';
import { DomainError, type Repo } from '../repository.ts';
import type { Invoice } from '../../types.ts';

export interface RecordPaymentInput {
  invoiceId: string;
  amount: number;
  paidAt: string; // ISO date
  actorId: string;
}

export interface PaymentResult {
  invoice: Invoice;
  fullyPaid: boolean;
  remaining: number;
}

export async function recordPayment(repo: Repo, input: RecordPaymentInput): Promise<PaymentResult> {
  if (input.amount <= 0) {
    throw new DomainError('INVALID_AMOUNT', '入金額は1円以上で入力してください。');
  }
  const invoice = await repo.getInvoice(input.invoiceId);

  if (invoice.status === 'draft') {
    throw new DomainError('NOT_ISSUED', 'この請求書はまだ発行されていません。発行してから入金を記録してください。');
  }
  if (invoice.status === 'paid') {
    throw new DomainError('ALREADY_PAID', 'この請求書はすでに入金済みです。');
  }

  const newPaid = invoice.paid_amount + input.amount;
  const remaining = Math.max(invoice.net_payable - newPaid, 0);
  const fullyPaid = newPaid >= invoice.net_payable;

  const patch: Partial<Invoice> = { paid_amount: newPaid };
  if (fullyPaid && canTransitionInvoice(invoice.status, 'paid')) {
    patch.status = 'paid';
    patch.paid_at = input.paidAt;
  }

  const updated = await repo.updateInvoice(input.invoiceId, patch);
  await repo.log({
    org_id: invoice.org_id, actor_id: input.actorId, target: 'invoice',
    action: fullyPaid ? 'paid' : 'partial_payment',
    meta: { invoice_id: invoice.id, amount: input.amount, remaining },
  });

  return { invoice: updated, fullyPaid, remaining };
}
