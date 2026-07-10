import { test } from 'node:test';
import assert from 'node:assert/strict';
import { can } from './permissions.ts';

test('owner は課金まで全許可', () => {
  assert.equal(can('billing.manage', { role: 'owner' }), true);
});

test('admin は課金だけ不可', () => {
  assert.equal(can('billing.manage', { role: 'admin' }), false);
  assert.equal(can('invoice.issue', { role: 'admin' }), true);
});

test('viewer は閲覧のみ', () => {
  assert.equal(can('record.viewAll', { role: 'viewer' }), true);
  assert.equal(can('quote.create', { role: 'viewer' }), false);
});

test("member の 'own' 判定: 自分の担当分のみ入金記録可", () => {
  const own = { role: 'member' as const, actorUserId: 'u1', resourceOwnerId: 'u1' };
  const other = { role: 'member' as const, actorUserId: 'u1', resourceOwnerId: 'u2' };
  assert.equal(can('payment.record', own), true);
  assert.equal(can('payment.record', other), false);
});
