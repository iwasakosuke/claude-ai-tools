/**
 * 定期ジョブ。Base44 の Scheduled function から日次で呼ぶ。
 *   - markOverdueCron: 支払期日を過ぎた issued → overdue
 *   - expireQuotesCron: 有効期限を過ぎた sent → expired
 *   - resetMonthlyCountersCron: 月初に *_count_this_month を 0 に(呼び出し側で全org巡回)
 */

import { canTransitionInvoice, canTransitionQuote } from '../../domain/index.ts';
import type { Repo } from '../repository.ts';

export async function markOverdueCron(repo: Repo, now = new Date().toISOString()): Promise<number> {
  const candidates = await repo.listOverdueCandidates(now);
  let count = 0;
  for (const inv of candidates) {
    if (inv.status === 'issued' && inv.due_date && inv.due_date < now.slice(0, 10)
        && canTransitionInvoice(inv.status, 'overdue')) {
      await repo.updateInvoice(inv.id, { status: 'overdue' });
      count++;
    }
  }
  return count;
}

export async function expireQuotesCron(repo: Repo, now = new Date().toISOString()): Promise<number> {
  const candidates = await repo.listExpirableQuotes(now);
  let count = 0;
  for (const q of candidates) {
    if (q.status === 'sent' && q.valid_until && q.valid_until < now.slice(0, 10)
        && canTransitionQuote(q.status, 'expired')) {
      await repo.updateQuote(q.id, { status: 'expired' });
      count++;
    }
  }
  return count;
}
