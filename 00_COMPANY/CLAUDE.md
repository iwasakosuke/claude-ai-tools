# 00_COMPANY/CLAUDE.md

このファイルは組織全体の運用ルールを Claude(Claude Code)に伝えるための最上位ドキュメントです。
各配下ディレクトリの CLAUDE.md / Knowledge.md はこの方針を継承します。

## ディレクトリ構成の役割

- `00_COMPANY/` : 全社共通ルール・方針(このファイル)
- `05_AUTOMATION/` : 自動化スクリプト・シートテンプレートの格納場所
- `07_CLIENTS/` : 案件ごとの作業フォルダ(案件名でサブフォルダを作成)
- `09_KNOWLEDGE_HUB/` : ナレッジベース(ジャンル別、`13_AUTOMATION/` は自動化ナレッジ)

## 自動化の原則

- 自動化を検討する際は `09_KNOWLEDGE_HUB/13_AUTOMATION/Knowledge.md` の ROI 基準・段階定義に従うこと。
- 新しい案件を開始する際は `05_AUTOMATION/scripts/init_project.sh` を使って `07_CLIENTS/(案件名)/` を初期化する。
- スクリプトは必ず「手動でも同じ結果になる手順」を README に併記し、属人化を避ける。
