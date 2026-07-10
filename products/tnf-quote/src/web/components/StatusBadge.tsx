import type { QuoteStatus, InvoiceStatus } from '../../types.ts';
import { QUOTE_STATUS_META, INVOICE_STATUS_META, type StatusMeta } from '../lib/statusMeta.ts';

interface Props {
  kind: 'quote' | 'invoice';
  status: QuoteStatus | InvoiceStatus;
}

/** 色 + 文字でステータスを表す。tone は CSS クラス(tokens.css)に対応。 */
export function StatusBadge({ kind, status }: Props) {
  const meta: StatusMeta =
    kind === 'quote'
      ? QUOTE_STATUS_META[status as QuoteStatus]
      : INVOICE_STATUS_META[status as InvoiceStatus];

  return (
    <span className={`badge badge--${meta.tone}`}>
      <span className="badge__dot" aria-hidden="true" />
      {meta.label}
    </span>
  );
}
