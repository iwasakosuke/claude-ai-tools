/**
 * 権限マトリクス(仕様 §4)。
 *
 * UI のボタン表示とサーバーの 403 判定が同じ表を参照するようにする。
 * member は「自分の担当分のみ」の操作があるため、対象の所有者判定を併用する。
 */

import type { Role } from '../types.ts';

export type Capability =
  | 'quote.create'
  | 'invoice.issue'
  | 'payment.record'
  | 'record.viewAll'
  | 'customer.manage'
  | 'member.invite'
  | 'billing.manage';

/** true=常に許可, false=不可, 'own'=自分の担当分のみ */
type Grant = boolean | 'own';

const MATRIX: Record<Role, Record<Capability, Grant>> = {
  owner: {
    'quote.create': true, 'invoice.issue': true, 'payment.record': true,
    'record.viewAll': true, 'customer.manage': true, 'member.invite': true,
    'billing.manage': true,
  },
  admin: {
    'quote.create': true, 'invoice.issue': true, 'payment.record': true,
    'record.viewAll': true, 'customer.manage': true, 'member.invite': true,
    'billing.manage': false,
  },
  member: {
    'quote.create': true, 'invoice.issue': true, 'payment.record': 'own',
    'record.viewAll': 'own', 'customer.manage': true, 'member.invite': false,
    'billing.manage': false,
  },
  viewer: {
    'quote.create': false, 'invoice.issue': false, 'payment.record': false,
    'record.viewAll': true, 'customer.manage': false, 'member.invite': false,
    'billing.manage': false,
  },
};

export interface AccessContext {
  role: Role;
  /** 判定対象リソースの担当者(owner_id)。'own' 判定に使う。 */
  resourceOwnerId?: string;
  /** アクセス主体の user_id。 */
  actorUserId?: string;
}

export function can(capability: Capability, ctx: AccessContext): boolean {
  const grant = MATRIX[ctx.role][capability];
  if (grant === true) return true;
  if (grant === false) return false;
  // 'own': 対象が自分の担当なら許可
  return !!ctx.actorUserId && ctx.actorUserId === ctx.resourceOwnerId;
}
