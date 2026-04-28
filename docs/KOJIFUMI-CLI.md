# kojifumi 用 GitHub CLI ラッパー

Enterprise Managed User など **別アカウント用の `gh` と普段の `gh` を両立**するために、ローカルに `kojifumi` / `kojifumi-gh` / `kojifumi-git` を用意しています。

## 置き場所

- 実行ファイル: `~/.local/bin/`（PATH に含まれていること）
- 説明: `~/.local/share/doc/kojifumi-cli/README.md`

## 初回

1. `gh auth login` で **kojifumi** を追加
2. `gh auth switch -u kojifumi -h github.com`
3. 必要なら `gh auth setup-git`

詳細は上記 README を参照。

## このリポジトリへ push する例

```bash
cd /Users/fkojima/dev/eds/aem-eds-demo-site
kojifumi-git push -u origin main
```
