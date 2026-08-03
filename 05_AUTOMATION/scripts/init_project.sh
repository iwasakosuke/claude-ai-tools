#!/usr/bin/env bash
#
# init_project.sh
#
# 用途:
#   新規案件のフォルダを 07_CLIENTS/ 配下に初期化する。
#   09_KNOWLEDGE_HUB/13_AUTOMATION/Knowledge.md の「第3段階: 半自動化」に対応するスクリプト。
#   ROI基準(月3回以上・1回15分以上発生する定型作業)を満たすため、
#   案件開始時のフォルダ作成・シートテンプレートのコピーを自動化している。
#
# 処理内容:
#   1. 07_CLIENTS/(案件名)/ を作成する(既に存在する場合はエラーで停止し、上書きしない)
#   2. 05_AUTOMATION/01_進行管理シート_template.xlsx と
#      02_成果物チェックシート_template.xlsx を案件フォルダにコピーする
#      (コピー先ではファイル名から "_template" を除いた名前になる)
#   3. images/ など、作業用サブフォルダを作成する
#
# 実行方法:
#   05_AUTOMATION/scripts/init_project.sh <案件名>
#
# 実行例:
#   05_AUTOMATION/scripts/init_project.sh test-project
#
# 注意:
#   このスクリプトはリポジトリのルート(claude-ai-tools/)からの相対パスで
#   05_AUTOMATION と 07_CLIENTS を参照する。スクリプト自身の場所を基準に
#   パスを解決しているため、どのディレクトリから実行しても動作する。
#
# 手動で同じ結果を得たい場合は 05_AUTOMATION/scripts/README.md の
# 「手動手順」を参照すること(スクリプトが使えない環境向け)。

set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "使い方: $0 <案件名>" >&2
  exit 1
fi

PROJECT_NAME="$1"

if [ -z "$PROJECT_NAME" ]; then
  echo "エラー: 案件名を空にすることはできません" >&2
  exit 1
fi

# 案件名にパス区切り文字が含まれる場合は意図しない場所への書き込みを防ぐため拒否する
case "$PROJECT_NAME" in
  */* | *..*)
    echo "エラー: 案件名に '/' や '..' を含めることはできません" >&2
    exit 1
    ;;
esac

# スクリプト自身の場所からリポジトリルートを解決する
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUTOMATION_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
REPO_ROOT="$(cd "${AUTOMATION_DIR}/.." && pwd)"

CLIENTS_DIR="${REPO_ROOT}/07_CLIENTS"
PROJECT_DIR="${CLIENTS_DIR}/${PROJECT_NAME}"

if [ -e "${PROJECT_DIR}" ]; then
  echo "エラー: 案件フォルダが既に存在します: ${PROJECT_DIR}" >&2
  exit 1
fi

echo "案件フォルダを作成します: ${PROJECT_DIR}"
mkdir -p "${PROJECT_DIR}"

# 作業用サブフォルダを作成
mkdir -p "${PROJECT_DIR}/images"
mkdir -p "${PROJECT_DIR}/deliverables"

# シートテンプレートをコピー(存在するものだけをコピーし、"_template" を除いた名前にする)
COPIED_ANY=0
for template in "${AUTOMATION_DIR}"/0[12]_*_template.xlsx; do
  [ -e "${template}" ] || continue
  base_name="$(basename "${template}")"
  dest_name="${base_name/_template/}"
  cp "${template}" "${PROJECT_DIR}/${dest_name}"
  echo "コピーしました: ${base_name} -> ${dest_name}"
  COPIED_ANY=1
done

if [ "${COPIED_ANY}" -eq 0 ]; then
  echo "警告: 05_AUTOMATION/ にシートテンプレート(01_*_template.xlsx, 02_*_template.xlsx)が見つかりませんでした" >&2
fi

echo ""
echo "完了しました: ${PROJECT_DIR}"
echo "$(cd "${PROJECT_DIR}" && find . -mindepth 1 | sort)"
