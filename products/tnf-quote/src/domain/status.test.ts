import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  canTransitionQuote,
  canTransitionInvoice,
  isInvoiceEditable,
  canConvertToInvoice,
} from './status.ts';

test('見積: draft→sent は可、draft→accepted は不可(先に送付)', () => {
  assert.equal(canTransitionQuote('draft', 'sent'), true);
  assert.equal(canTransitionQuote('draft', 'accepted'), false);
});

test('見積: sent から 受注/失注/期限切れ', () => {
  assert.equal(canTransitionQuote('sent', 'accepted'), true);
  assert.equal(canTransitionQuote('sent', 'rejected'), true);
  assert.equal(canTransitionQuote('sent', 'expired'), true);
});

test('見積: expired は再送で復活', () => {
  assert.equal(canTransitionQuote('expired', 'sent'), true);
});

test('請求: issued→overdue→paid の経路', () => {
  assert.equal(canTransitionInvoice('issued', 'overdue'), true);
  assert.equal(canTransitionInvoice('overdue', 'paid'), true);
  assert.equal(canTransitionInvoice('paid', 'issued'), false);
});

test('編集可否と請求書化の可否', () => {
  assert.equal(isInvoiceEditable('draft'), true);
  assert.equal(isInvoiceEditable('issued'), false);
  assert.equal(canConvertToInvoice('accepted'), true);
  assert.equal(canConvertToInvoice('sent'), false);
});
