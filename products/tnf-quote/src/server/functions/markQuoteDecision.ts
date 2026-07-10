/**
 * markQuoteDecision — 受注/失注を手動記録(電子承認は作らない方針)。
 */

import { canTransitionQuote } from '../../domain/index.ts';
import { DomainError, type Repo } from '../repository.ts';
import type { Quote, QuoteStatus } from '../../types.ts';

export async function markQuoteDecision(
  repo: Repo,
  input: { quoteId: string; decision: 'accepted' | 'rejected'; actorId: string },
): Promise<Quote> {
  const quote = await repo.getQuote(input.quoteId);

  if (!canTransitionQuote(quote.status, input.decision as QuoteStatus)) {
    throw new DomainError(
      'INVALID_TRANSITION',
      `この見積(${statusLabel(quote.status)})は受注/失注をマークできません。送付済みの見積で操作してください。`,
    );
  }

  const updated = await repo.updateQuote(input.quoteId, {
    status: input.decision,
    decided_at: new Date().toISOString(),
  });

  await repo.log({
    org_id: quote.org_id, actor_id: input.actorId, target: 'quote',
    action: 'decision', meta: { quote_id: quote.id, decision: input.decision },
  });
  return updated;
}

function statusLabel(s: QuoteStatus): string {
  return { draft: '下書き', sent: '送付済み', accepted: '受注', rejected: '失注', expired: '期限切れ' }[s];
}
