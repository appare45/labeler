# Labeler

GitHubのラベル作成を一括で行うツールです。

yamlファイルに次の形式でラベルの一覧を定義します。

```yml
labels:
  - name: "Type: Bug Fix"
    description: "バグの修正"
    color: "#FF7043" 
```

.envファイルか環境変数に`GITHUB_TOKEN`を設定します。

Tokenは目的のリポジトリの`issue:write`権限を付与しておく必要があります。

denoで次のように実行するとラベルが作成されます。

```bash
deno run --allow-read --allow-env --allow-net main.ts appare45/labeler./example.yml
```