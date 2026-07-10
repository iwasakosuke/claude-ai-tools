/**
 * markQuoteSent — 見積を「送付済み」にする。
 * PDF をダウンロード/メール添付送付したタイミングで draft → sent に遷移。
 * 受注/失注マークはこの後にのみ可能(状態機械で保証)。
 */

import { canTransitionQuote } from '../../domain/index.ts';
import { DomainError, type Repo } from '../repository.ts';
import type { Quote } from '../../types.ts';

export async function markQuoteSent(
  repo: Repo,
  input: { quoteId: string; actorId: string },
): Promise<Quote> {
  const quote = await repo.getQuote(input.quoteId);
  if (!canTransitionQuote(quote.status, 'sent')) {
    throw new DomainError('INVALID_TRANSITION', 'この見積は送付済みにできません。下書きまたは期限切れの見積で操作してください。');
  }
  const updated = await repo.updateQuote(input.quoteId, {
    status: 'sent',
    sent_at: new Date().toISOString(),
  });
  await repo.log({
    org_id: quote.org_id, actor_id: input.actorId, target: 'quote',
    action: 'sent', meta: { quote_id: quote.id },
  });
  return updated;
}
