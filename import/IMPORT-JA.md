# 日本語コンテンツの反映手順（index / nav / footer）

AEM Author のコンテンツは Git ではなく **Author 上の HTML** が正本です。  
以下を Universal Editor で差し替え、**Publish** してください。

参照ファイル:

- ホーム: `import/index.ja.plain.html`
- ナビ: `nav.plain.html`（リポジトリルート）
- フッター: `footer.plain.html`

プレビュー: https://main--aem-eds-demo-site--kojifumi.aem.page/

Author: https://author-p159404-e1696482.adobeaemcloud.com/content/aem-eds-demo-site/index.html

---

## 1. ホーム（index）

UE で各セクションを開き、`import/index.ja.plain.html` の文言に合わせて更新します。

| セクション | Style（metadata） | 主な日本語コピー |
|-----------|-------------------|------------------|
| Hero | （Hero Gradient ブロック） | エンタープライズ AI プラットフォーム / 世界を前に進める知性 / 世界を動かす / リード文 / 無料で始める・製品を見る |
| Stats | highlight, stats | 1,000万+ / 99.9% / 150+ |
| Products | products | 見出し・3 カード本文 |
| How It Works | how-it-works, highlight | 3 ステップ |
| Testimonial | testimonial | 引用・陳 美咲, CTO |
| FAQ | faq | よくある質問・5 項目 |
| CTA | cta-banner | いまから、ビジネスの変革を… |

**Hero の Highlight 行**（「世界を動かす」）は h1 とは別セル／フィールドのままにしてください。

**Section metadata の style 値**（`faq`, `stats` など）は **英語のまま**（CSS 用キー）。

---

## 2. ナビ（nav ページ）

| 位置 | 日本語 |
|------|--------|
| ロゴ | Nexara AI（` AI` は span でシアンでも可） |
| リンク | 製品 / ソリューション / 料金 / ドキュメント |
| CTA | 無料で始める |

---

## 3. フッター（footer ページ）

`© 2026 Nexara AI, Inc. 無断転載を禁じます。`

---

## 4. コード側（push 済み後）

- `lang`: デフォルト `ja`
- フォント: ヒラギノ・Meiryo などシステムフォントを追加

---

## 5. 公開

1. index / nav / footer を **Publish**
2. プレビューをハードリロード
3. `index.plain.html` が日本語になっているか確認
