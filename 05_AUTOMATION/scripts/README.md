# 05_AUTOMATION/scripts

案件初期化まわりの自動化スクリプトを置くフォルダ。
自動化の考え方(ROI基準・3段階)は `09_KNOWLEDGE_HUB/13_AUTOMATION/Knowledge.md` を参照。

## init_project.sh

新規案件のフォルダを `07_CLIENTS/(案件名)/` に作成し、シートテンプレートをコピーする。

### 実行方法

```bash
05_AUTOMATION/scripts/init_project.sh <案件名>
```

例:

```bash
05_AUTOMATION/scripts/init_project.sh acme-corp
```

### スクリプトが行うこと

1. `07_CLIENTS/(案件名)/` を作成(既に存在する場合はエラーで停止し、既存フォルダを壊さない)
2. `05_AUTOMATION/01_進行管理シート_template.xlsx` と `02_成果物チェックシート_template.xlsx` を
   案件フォルダにコピー(コピー先では `_template` を除いたファイル名になる)
3. `images/`、`deliverables/` の作業用サブフォルダを作成

---

## 手動手順(スクリプトを使わない場合)

スクリプトが使えない環境(権限がない、Windowsでシェルが動かない等)でも、
以下の5ステップで `init_project.sh` と全く同じ結果を作れる。

1. **案件フォルダを作成する**
   `07_CLIENTS/` の中に、案件名と同じ名前のフォルダを新規作成する。
   例: `07_CLIENTS/acme-corp/`

2. **進行管理シートをコピーする**
   `05_AUTOMATION/01_進行管理シート_template.xlsx` をコピーし、
   `07_CLIENTS/acme-corp/01_進行管理シート.xlsx` として保存する(`_template` は外す)。

3. **成果物チェックシートをコピーする**
   `05_AUTOMATION/02_成果物チェックシート_template.xlsx` をコピーし、
   `07_CLIENTS/acme-corp/02_成果物チェックシート.xlsx` として保存する(`_template` は外す)。

4. **作業用サブフォルダを作成する**
   `07_CLIENTS/acme-corp/` の中に `images/` フォルダと `deliverables/` フォルダを新規作成する。

5. **内容を確認する**
   `07_CLIENTS/acme-corp/` の中に、以下がすべて揃っていることを確認する。
   - `01_進行管理シート.xlsx`
   - `02_成果物チェックシート.xlsx`
   - `images/`
   - `deliverables/`
