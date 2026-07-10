/**
 * TNF Quote — 共有型定義
 *
 * Base44 のエンティティ(entities/*.json)と 1:1 で対応する。
 * サーバー確定フィールド(金額・番号・ステータス)はフロントで書き換えず、
 * ここでは「サーバーが返す形」を型として表現する。
 */

// ---- 列挙 -------------------------------------------------------------

export type Plan = 'free' | 'solo' | 'studio' | 'agency';

export type Role = 'owner' | 'admin' | 'member' | 'viewer';

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export type InvoiceStatus = 'draft' | 'issued' | 'paid' | 'overdue';

/** 請求種別: 全額 / 着手金(前金) / 残金 */
export type BillingType = 'full' | 'deposit' | 'final';

export type TemplateKind = 'quote' | 'invoice';

// ---- 共通 -------------------------------------------------------------

/** Base44 が全エンティティに自動付与する基底フィールド */
export interface Base44Base {
  id: string;
  created_date: string;
  updated_date: string;
  created_by: string;
}

/** 金額は円・整数で保持する(サーバー確定)。小数は扱わない。 */
export type Yen = number;

// ---- エンティティ -----------------------------------------------------

export interface Organization extends Base44Base {
  name: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  /** 適格請求書発行事業者の登録番号 (T+13桁) */
  invoice_reg_number?: string;
  /** 個人事業主なら源泉徴収を既定ON */
  is_individual: boolean;
  bank_info?: string;
  quote_prefix: string;
  quote_seq: number;
  /** 請求番号は見積番号とは別採番 */
  invoice_prefix: string;
  invoice_seq: number;
  default_tax_rate: number;
  default_valid_days: number;
  plan: Plan;
  quote_count_this_month: number;
  invoice_count_this_month: number;
}

export interface Membership extends Base44Base {
  org_id: string;
  user_id: string;
  role: Role;
  status: 'active' | 'invited' | 'suspended';
}

export interface Customer extends Base44Base {
  org_id: string;
  company_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  /** 法人か(源泉徴収の要否判定に使う) */
  is_corporate: boolean;
  memo?: string;
}

export interface Quote extends Base44Base {
  org_id: string;
  customer_id: string;
  quote_number: string;
  title: string;
  status: QuoteStatus;
  subtotal: Yen;
  discount: Yen;
  tax: Yen;
  total: Yen;
  valid_until?: string;
  notes?: string;
  owner_id: string;
  sent_at?: string;
  decided_at?: string;
}

export interface QuoteItem extends Base44Base {
  quote_id: string;
  name: string;
  description?: string;
  quantity: number;
  unit_price: Yen;
  tax_rate: number;
  line_total: Yen;
  sort_order: number;
  /** 源泉徴収の対象品目か(デザイン/制作報酬など)。既定 true */
  withholding_eligible: boolean;
}

export interface Invoice extends Base44Base {
  org_id: string;
  customer_id: string;
  quote_id?: string;
  invoice_number: string;
  title: string;
  billing_type: BillingType;
  status: InvoiceStatus;
  subtotal: Yen;
  discount: Yen;
  tax: Yen;
  /** 源泉徴収税額(差引) */
  withholding_tax: Yen;
  /** 請求総額(源泉控除前) */
  total: Yen;
  /** 差引支払額(源泉控除後) */
  net_payable: Yen;
  due_date?: string;
  issued_at?: string;
  paid_at?: string;
  paid_amount: Yen;
}

export interface InvoiceItem extends Base44Base {
  invoice_id: string;
  name: string;
  description?: string;
  quantity: number;
  unit_price: Yen;
  tax_rate: number;
  line_total: Yen;
  sort_order: number;
  withholding_eligible: boolean;
}

export interface Template extends Base44Base {
  org_id: string;
  name: string;
  kind: TemplateKind;
  /** 明細セットの JSON(CalcLineItem[] 相当 + 表示用 name/description) */
  items_json: string;
  default_notes?: string;
}

export interface ActivityLog extends Base44Base {
  org_id: string;
  actor_id: string;
  target: 'quote' | 'invoice';
  action: string;
  meta?: Record<string, unknown>;
}
