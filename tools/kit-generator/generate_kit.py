#!/usr/bin/env python3
"""顧客向け「業務AI資産キット」生成ツール。

このリポジトリのSkill・テンプレート・QAチェックリストをマスターとして、
顧客情報(JSON)に合わせてカスタマイズした納品キットを新規フォルダに生成する。

使い方:
    python3 generate_kit.py client.json            # 生成
    python3 generate_kit.py client.json --dry-run  # 生成内容の確認のみ
"""
import argparse
import json
import shutil
import sys
from datetime import date
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

# Skillごとに同梱するテンプレート・チェックリスト
SKILL_ASSETS = {
    "mail-triage":    {"templates": [],                        "checklists": ["qa-文章.md"]},
    "mail-reply":     {"templates": ["メール返信パターン集.md"],  "checklists": ["qa-文章.md"]},
    "minutes":        {"templates": ["議事録テンプレート.md"],    "checklists": ["qa-文章.md"]},
    "weekly-report":  {"templates": ["週報テンプレート.md"],      "checklists": ["qa-文章.md"]},
    "research-brief": {"templates": ["リサーチブリーフ.md"],      "checklists": ["qa-文章.md"]},
    "proposal-draft": {"templates": ["提案書テンプレート.md"],    "checklists": ["qa-提案書.md"]},
    "sns-post":       {"templates": ["SNS投稿テンプレート.md"],   "checklists": ["qa-デザイン.md"]},
    "dev-script":     {"templates": [],                        "checklists": ["qa-コード.md"]},
    "asset-review":   {"templates": [],                        "checklists": []},
}

USAGE_EXAMPLES = {
    "mail-triage":    "「メール整理して」→ 受信箱を優先度A〜Dで仕分け",
    "mail-reply":     "「このメールの返信作って」→ 文体を合わせた下書き(送信はしない)",
    "minutes":        "「このメモ議事録にして」→ 決定事項・ToDo付き議事録",
    "weekly-report":  "「週報作って」→ 今週の記録から実績を整形",
    "research-brief": "「〜について調べて」→ 推奨アクション付き1枚ブリーフ",
    "proposal-draft": "「〜の提案書作りたい」→ 構成合意→ドラフトの2段階",
    "sns-post":       "「SNS投稿作って」→ 3案+デザイン指示(投稿はしない)",
    "dev-script":     "「〜を自動化して」→ 要件→実装→テスト→READMEのSOP",
    "asset-review":   "「週次レビューして」→ 資産の棚卸しと改善提案",
}

CLAUDE_MD = """# {client_name} 様 業務AI資産キット — 作業ルール

このリポジトリ(フォルダ)は {client_name} 様の業務資産です。Claude Codeはここで作業するとき、以下を守ってください。

## 最優先ルール(安全)
- メール送信 / SNS・外部への投稿 / 外部サービスへのデータ送信 / 課金が発生する操作 / 既存ファイルの上書き・削除 は、**内容を提示して承認を得るまで実行しない**
- 認証情報をコード・ログ・コミットに含めない
{forbidden_lines}
## 文体・トーン
- {tone}

## 作業の進め方
- 依頼が来たら `.claude/skills/` の該当Skillに従う
- 成果物は `templates/` の型で作り、`checklists/` のQAを自分で通して結果を添える
- ファイル名は `YYYYMMDD_種別_案件名_v番号` 形式。旧版は消さない
- 不明点は仮説で進め、**【仮説】** と明記する。金額・可否・公開判断は **【要判断】** にする
"""

OPS_MD = """# 運用ルール({client_name} 様向け)

## 1. 安全ルール(絶対ルール・承認必須)
| 操作 | 扱い |
|---|---|
| メール送信・SNS投稿・外部公開 | AIはドラフトまで。実行は人間 |
| 外部サービスへのデータ送信・共有設定変更 | 事前承認必須 |
| 課金が発生する操作 | 事前承認必須 |
| 既存ファイルの上書き・削除 | 新規作成のみ。差し替えは人間が判断 |
{forbidden_rows}
## 2. ファイル命名規則
`YYYYMMDD_種別_案件名_v番号.拡張子`(例: {today_compact}_議事録_定例MTG_v1.md)
修正は v2, v3 と上げる。旧版は消さない。

## 3. 保存ルール
| 成果物 | 保存先 |
|---|---|
| ドラフト・作業中 | このキットの `work/` |
| 確定した文書 | {storage_docs} |
| ナレッジ・議事録の蓄積 | {storage_knowledge} |

## 4. 品質ゲート
提出・送信・公開の前に `checklists/` の該当QAを必ず通す。AIはセルフチェック結果を成果物に添える。★印は人間が目視する。

## 5. 改善サイクル
AIの出力を手で直したら、週1回の「週次レビューして」で直しをテンプレ/Skillに反映する。効果は `docs/効果ログ.md` に追記する(過去行の書き換え禁止)。
"""

KIT_README = """# {client_name} 様 業務AI資産キット

納品日: {today} / 構築: {vendor}

## 🚀 使い方(3ステップ)
1. Claude Code でこのフォルダを開く
2. 普通に依頼する(下の一覧の言い方で話しかけるだけ)
3. 週1回「週次レビューして」と依頼して、キットを業務に合わせて育てる

## 📦 導入されているSkill
| 依頼の例 | 何が起きるか |
|---|---|
{skill_rows}
## 🔒 安全原則
メール送信・SNS投稿・外部送信・課金・既存ファイルの上書き/削除は、AIは**絶対に勝手に実行しません**。詳細: `docs/運用ルール.md`

## 🌱 導入後にやると効果が大きいこと
- `templates/メール返信パターン集.md` に実際のメールを3〜5通貼る(文体再現の精度が大きく向上)
- よく作る資料の過去の良い例をテンプレに反映する
"""

EFFECT_LOG = """# 効果ログ(追記のみ・書き換え禁止)

| 日付 | 変更・出来事 | 期待効果 / 実測 |
|---|---|---|
| {today} | 業務AI資産キット 導入 | 定型作業の時間 50%減を目標 |
"""


def load_config(path: Path) -> dict:
    try:
        config = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        sys.exit(f"エラー: 設定ファイルが見つかりません: {path}")
    except json.JSONDecodeError as e:
        sys.exit(f"エラー: JSONの形式が不正です({path}): {e}")

    if not config.get("client_name"):
        sys.exit("エラー: client_name は必須です")

    skills = config.get("skills", "all")
    if skills == "all":
        config["skills"] = list(SKILL_ASSETS)
    else:
        unknown = [s for s in skills if s not in SKILL_ASSETS]
        if unknown:
            sys.exit(
                f"エラー: 不明なSkill: {', '.join(unknown)}\n"
                f"利用可能: {', '.join(SKILL_ASSETS)}"
            )
    return config


def build_plan(config: dict, out_dir: Path) -> list[tuple[str, Path, Path | str]]:
    """(種別, 出力先, コピー元 or 生成内容) のリストを作る。"""
    today = date.today()
    skills = config["skills"]
    tone = config.get("tone", "敬体・標準的なビジネストーン【仮説・ヒアリングで確定】")
    storage = config.get("storage", {})
    forbidden = config.get("forbidden", [])

    forbidden_lines = "".join(
        f"- {item} は行わない(顧客指定の禁止事項)\n" for item in forbidden
    )
    forbidden_rows = "".join(
        f"| {item} | 禁止(顧客指定) |\n" for item in forbidden
    )
    skill_rows = "".join(
        f"| {USAGE_EXAMPLES[s].split('→')[0].strip()} | {USAGE_EXAMPLES[s].split('→')[1].strip()} |\n"
        for s in skills
    )

    generated = {
        "CLAUDE.md": CLAUDE_MD.format(
            client_name=config["client_name"], tone=tone,
            forbidden_lines=forbidden_lines,
        ),
        "README.md": KIT_README.format(
            client_name=config["client_name"], today=today.isoformat(),
            vendor=config.get("vendor", "【要判断: 屋号/名前】"),
            skill_rows=skill_rows,
        ),
        "docs/運用ルール.md": OPS_MD.format(
            client_name=config["client_name"],
            today_compact=today.strftime("%Y%m%d"),
            forbidden_rows=forbidden_rows,
            storage_docs=storage.get("docs", "【要判断: 確定文書の保存先】"),
            storage_knowledge=storage.get("knowledge", "【要判断: ナレッジの保存先】"),
        ),
        "docs/効果ログ.md": EFFECT_LOG.format(today=today.isoformat()),
        "work/.gitkeep": "",
    }

    plan: list[tuple[str, Path, Path | str]] = [
        ("生成", out_dir / rel, content) for rel, content in generated.items()
    ]

    copied_templates: set[str] = set()
    copied_checklists: set[str] = set()
    for skill in skills:
        plan.append((
            "コピー", out_dir / ".claude/skills" / skill / "SKILL.md",
            REPO_ROOT / ".claude/skills" / skill / "SKILL.md",
        ))
        copied_templates.update(SKILL_ASSETS[skill]["templates"])
        copied_checklists.update(SKILL_ASSETS[skill]["checklists"])

    for name in sorted(copied_templates):
        plan.append(("コピー", out_dir / "templates" / name, REPO_ROOT / "templates" / name))
    for name in sorted(copied_checklists):
        plan.append(("コピー", out_dir / "checklists" / name, REPO_ROOT / "checklists" / name))
    return plan


def main() -> None:
    parser = argparse.ArgumentParser(description="顧客向け業務AI資産キットを生成する")
    parser.add_argument("config", type=Path, help="顧客設定JSON(sample_client.json 参照)")
    parser.add_argument("-o", "--output-base", type=Path,
                        default=Path(__file__).parent / "output",
                        help="出力先の親フォルダ(既定: tools/kit-generator/output/)")
    parser.add_argument("--dry-run", action="store_true", help="生成せず内容の一覧だけ表示する")
    args = parser.parse_args()

    config = load_config(args.config)
    dir_name = f"{date.today().strftime('%Y%m%d')}_キット_{config['client_name']}_v1"
    out_dir = args.output_base / dir_name

    # 上書き禁止ルール: 既存フォルダには書かない
    if out_dir.exists():
        sys.exit(
            f"エラー: 出力先が既に存在します: {out_dir}\n"
            "上書きはしません。フォルダ名を変えるか、既存フォルダを人間の判断で退避してください。"
        )

    plan = build_plan(config, out_dir)

    missing = [str(src) for kind, _, src in plan
               if kind == "コピー" and isinstance(src, Path) and not src.exists()]
    if missing:
        sys.exit("エラー: マスターファイルが見つかりません:\n  " + "\n  ".join(missing))

    print(f"出力先: {out_dir}")
    for kind, dst, _ in plan:
        print(f"  [{kind}] {dst.relative_to(out_dir)}")

    if args.dry_run:
        print(f"\n--dry-run のため生成していません(全{len(plan)}ファイル)")
        return

    for kind, dst, src in plan:
        dst.parent.mkdir(parents=True, exist_ok=True)
        if kind == "コピー":
            shutil.copy2(src, dst)
        else:
            dst.write_text(src, encoding="utf-8")

    print(f"\n✅ 完了: {len(plan)}ファイルを生成しました")
    print("次にやること: 顧客ヒアリングで【要判断】【仮説】箇所を確定 → メール文体サンプルを貼る → 納品")


if __name__ == "__main__":
    main()
