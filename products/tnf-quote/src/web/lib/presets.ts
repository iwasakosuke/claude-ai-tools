/**
 * 制作向けの明細プリセット(仕様 §5「制作テンプレを標準搭載」)。
 * 呼び出して数字を入れるだけにする。単価は目安の初期値。
 */
import type { EditableItem } from '../components/LineItemEditor.tsx';

export interface Preset {
  key: string;
  label: string;
  item: EditableItem;
}

export const PRODUCTION_PRESETS: Preset[] = [
  { key: 'site', label: 'サイト制作費', item: { name: 'サイト制作費', quantity: 1, unit_price: 300_000, tax_rate: 0.1, withholding_eligible: true } },
  { key: 'page', label: 'ページ単価', item: { name: 'ページ制作', quantity: 1, unit_price: 30_000, tax_rate: 0.1, withholding_eligible: true } },
  { key: 'design', label: 'デザイン費', item: { name: 'デザイン費', quantity: 1, unit_price: 150_000, tax_rate: 0.1, withholding_eligible: true } },
  { key: 'coding', label: 'コーディング', item: { name: 'コーディング', quantity: 1, unit_price: 120_000, tax_rate: 0.1, withholding_eligible: true } },
  { key: 'direction', label: 'ディレクション', item: { name: 'ディレクション', quantity: 1, unit_price: 80_000, tax_rate: 0.1, withholding_eligible: true } },
  { key: 'maintenance', label: '保守(月額)', item: { name: '保守費(月額)', quantity: 1, unit_price: 10_000, tax_rate: 0.1, withholding_eligible: true } },
  // ドメイン・サーバー代行は実費立替なので源泉対象外にしておく
  { key: 'infra', label: 'ドメイン・サーバー代行', item: { name: 'ドメイン・サーバー代行', quantity: 1, unit_price: 20_000, tax_rate: 0.1, withholding_eligible: false } },
];
