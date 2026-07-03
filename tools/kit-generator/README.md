# kit-generator — 業務AI資産キット生成ツール

顧客情報(JSON)から、カスタマイズ済みの「業務AI資産キット」(CLAUDE.md・Skill・テンプレ・QA・運用ルール)を新規フォルダに生成する。**構築代行の納品物を数時間で作るためのツール。**

## 使い方(コピペで動く)

```bash
cd tools/kit-generator
cp sample_client.json client_顧客名.json   # 顧客に合わせて編集
python3 generate_kit.py client_顧客名.json --dry-run   # まず生成内容を確認
python3 generate_kit.py client_顧客名.json             # 生成
```

出力先: `tools/kit-generator/output/YYYYMMDD_キット_顧客名_v1/`(git管理外)

## 入力(JSON)

| キー | 必須 | 内容 |
|---|---|---|
| `client_name` | ✅ | 顧客名(出力フォルダ名・文書に使用) |
| `skills` | - | 導入するSkill名の配列、または `"all"`(既定: all) |
| `tone` | - | 文体・トーンの指定 |
| `storage` | - | `docs` / `knowledge` の保存先 |
| `forbidden` | - | 顧客固有の禁止事項(安全ルールに追記される) |
| `vendor` | - | 納品者名(キットREADMEに記載) |

## 出力

顧客名入りの `CLAUDE.md`(安全ルール+トーン)、`README.md`(使い方)、`docs/運用ルール.md`、`docs/効果ログ.md` を**生成**し、選択したSkillと対応するテンプレ・QAチェックリストを本リポジトリから**コピー**する。

## 環境変数
不要(Python 3.9+ 標準ライブラリのみ。外部送信なし)

## 注意
- 既存フォルダには**絶対に書き込まない**(存在したらエラーで停止。上書き禁止ルール準拠)
- 生成後にやること: ヒアリングで【要判断】【仮説】を確定 → メール文体サンプルをテンプレに貼る → 納品
- マスター(このリポジトリのSkill・テンプレ)を改善すれば、以後の全納品キットに反映される
