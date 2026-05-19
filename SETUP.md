# AEM EDS Demo Site — Setup Guide

This guide covers all the setup steps required after the GitHub repository has been created.

---

## Step 1: Install aem-code-sync (Human Action Required)

The aem-code-sync GitHub App connects this repository to AEM's content delivery pipeline.

> **Action required:**
>
> 1. Open: [https://github.com/apps/aem-code-sync/installations/new](https://github.com/apps/aem-code-sync/installations/new)
> 2. Under "Repository access", select **Only select repositories**
> 3. Choose **kojifumi/aem-eds-demo-site** from the list
> 4. Click **Save**

**Verify:** After installing, the following URL should return a valid JSON response (not 404):

```
https://admin.hlx.page/status/kojifumi/aem-eds-demo-site/main/
```

---

## Step 2: Create an AEM Site in AEM as a Cloud Service

**Reference:** [Create an AEM site](https://experienceleague.adobe.com/en/docs/experience-manager-learn/sites/edge-delivery-services/developing/universal-editor/2-new-aem-site)

1. Log in to AEM Author:
  ```
   https://author-p159404-e1696482.adobeaemcloud.com
  ```
2. Navigate to **Sites > Create > Site from Template**
3. Select the **Edge Delivery Services** site template (import it first if unavailable)
4. Configure:
  - **Title**: `AEM EDS Demo Site`
  - **Name** (URL path): `aem-eds-demo-site`
5. Click **Create**

The new site will be created at:

```
/content/aem-eds-demo-site/
```

---

## Step 3: Verify fstab.yaml Configuration

The repository's `fstab.yaml` is already configured to point to this Author environment:

```yaml
mountpoints:
  /:
    url: "https://author-p159404-e1696482.adobeaemcloud.com/bin/franklin.delivery/kojifumi/aem-eds-demo-site/main"
    type: "markup"
    suffix: ".html"
```

And `paths.json` maps the AEM content path to the site root:

```json
{
  "mappings": [
    "/content/aem-eds-demo-site/:/"
  ],
  "includes": [
    "/content/aem-eds-demo-site/"
  ]
}
```

No changes are needed unless you rename the AEM site path.

---

## Step 4: Configure Universal Editor Service

To enable the Universal Editor on this site:

1. In AEM Author, navigate to the site page you want to edit
2. Open **Page Properties > Advanced**
3. Set the **Universal Editor URL** to:
  ```
   https://experience.adobe.com/#/aem/editor/canvas
  ```
4. Verify the page template includes the required Universal Editor instrumentation script in `<head>`:
  ```html
   <script>
     var ue = {
       "editurl": "https://main--aem-eds-demo-site--kojifumi.aem.page/",
     };
   </script>
  ```

This is already handled by `head.html` in the boilerplate.

---

## Step 5: Local Development

```bash
cd /Users/fkojima/dev/aem-eds-demo-site
npm install
aem up
```

The local dev server starts at `http://localhost:3000`. Content is proxied from the AEM Author.

To target the specific preview URL:

```bash
aem up --url https://main--aem-eds-demo-site--kojifumi.aem.page
```

---

## Step 6b: Universal Editor — Section Style (FAQ など) が出ないとき

UE のセクション **Style** は GitHub の `component-models.json`（`models/_section.json` から `npm run build:json` で生成）を読み込みます。

1. **プレビューで定義を確認**（FAQ が含まれること）:
   ```
   https://main--aem-eds-demo-site--kojifumi.aem.page/component-models.json
   ```
   `section` モデルの `options` に `"name": "FAQ"` があること。

2. **モデルを変更したら** リポジトリで再生成して `main` に push:
   ```bash
   npm run build:json
   git add component-models.json component-definition.json component-filters.json
   git commit -m "chore: rebuild UE component JSON"
   git push
   ```

3. **AEM Author の UE を完全に閉じて開き直す**（キャッシュ対策）。

4. **当面の回避策**（FAQ が Style 一覧に無い場合）:
   - Section metadata の **Style** で **`Highlight`** のみ選択し、セクションに **Accordion** を置く（見た目は FAQ 用 CSS が適用されます）
   - または metadata の値に手動で `faq` と入力できる UI ならそれを使用

---

## Step 6a: Create Nav and Footer Pages (AEM Author)

The header and footer blocks load content from **`/nav`** and **`/footer`** fragments. Create two pages under the site (sibling to the homepage), then publish.

### Nav page (`…/nav`)

1. In AEM Author, under **AEM EDS Demo Site**, create a page named **`nav`** (title: Navigation).
2. Open the page in **Universal Editor** (or edit as HTML) and set the body to match `nav.plain.html` in this repo:

```html
<main>
  <div>
    <div>
      <p><a href="/">Nexara<span> AI</span></a></p>
    </div>
    <div>
      <ul>
        <li><a href="/#products">Products</a></li>
        <li><a href="/#solutions">Solutions</a></li>
        <li><a href="/#pricing">Pricing</a></li>
        <li><a href="/#docs">Docs</a></li>
      </ul>
    </div>
    <div>
      <p><strong><a href="/signup">Get Started Free</a></strong></p>
    </div>
  </div>
</main>
```

Structure: **3 sibling `<div>`s** directly under `<main>` (no extra wrapper) — brand link (not bold), nav `<ul>` with `<a>` on each item, CTA in `<strong><a>` only.

### Footer page (`…/footer`)

1. Create a page named **`footer`** (title: Footer).
2. Body content (see `footer.plain.html`):

```html
<main>
  <div>
    <div>
      <p>© 2026 Nexara AI, Inc. All rights reserved.</p>
    </div>
  </div>
</main>
```

### Publish and verify

1. **Publish** both pages (and the homepage if needed).
2. Confirm fragments load:
   - `https://main--aem-eds-demo-site--kojifumi.aem.page/nav.plain.html`
   - `https://main--aem-eds-demo-site--kojifumi.aem.page/footer.plain.html`
3. Reload the homepage — sticky nav (logo, links, **Get Started Free**) and footer should appear.

Optional: on the homepage **Page metadata**, set `nav` → `/nav` and `footer` → `/footer` if your template uses custom paths (defaults are `/nav` and `/footer`).

---

## Step 6: Verify Preview URL

After aem-code-sync is installed and the AEM site is created, the preview URL will be:

```
https://main--aem-eds-demo-site--kojifumi.aem.page/
```

---

## GitHub: `kojifumi` 

コードと `fstab.yaml` は `**kojifumi/aem-eds-demo-site**` を前提にしています。

---

## Cursor MCP（`.cursor/mcp.json`）

- **ユーザー全体の設定**なら `**~/.cursor/mcp.json`** に書いてもよい（このリポを開いていなくても同じ MCP が使える）。
- リポジトリ単位なら、ローカルに `**.cursor/mcp.json**` を置く（**Git には含めない** — `.gitignore` 済み）。
- 雛形は `**.cursor/mcp.json.example`**。初回はコピーしてトークンを入れる:  
`cp .cursor/mcp.json.example .cursor/mcp.json`
- **AEM** の `url` 型サーバーは Cursor の MCP 画面で **Connect** し、**Adobe ID** でサインイン。
- **Helix** は `HELIX_ADMIN_API_TOKEN` が必要。トークンは **リポジトリに push しない**。

---

## AEM MCP と権限（他環境を誤操作しないために）

MCP 経由の操作は **OAuth した Adobe ID と同じ権限**で実行されます（[AEM as a Cloud Service での MCP の使用 — 認証と権限](https://experienceleague.adobe.com/ja/docs/experience-manager-cloud-service/content/ai-in-aem/mcp-support/using-mcp-with-aem-as-a-cloud-service?lang=ja)）。Cursor の「Connected」は認証の成功であり、**環境やサイトへの自動スコープはありません**。デモ以外を触りたくない場合は次を組み合わせる。

### 1. Adobe / Cloud Manager（強い制御）

- **組織管理者**: [MCP の利用ポリシー](https://experienceleague.adobe.com/ja/docs/experience-manager-cloud-service/content/ai-in-aem/mcp-support/using-mcp-with-aem-as-a-cloud-service?lang=ja)どおり、必要なら **MCP サーバー単位・クライアント単位の制限**を検討（管理者向け）。
- **Cloud Manager**: [カスタム権限](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/implementing/using-cloud-manager/custom-permissions)で、このユーザー／グループを **デモ用プログラム・環境にだけ**紐づけると、**Cloud Manager MCP** で他プログラムを操作しにくくなる。

### 2. AEM Author（コンテンツパス）

- デモ用サイトルートは `**/content/aem-eds-demo-site/`**。MCP の Content ツールも **そのユーザーに許された ACL の範囲**でのみ成功する。本番ツリーへの権限を付けなければ、MCP からも更新できない。

### 3. Cursor・運用（補助）

- **書き込みを絞る**: 調査だけなら `**content-readonly`** の MCP だけにし、`aem-content` を外す方法がある（書き換え・削除の経路を減らす）。
- **Cloud Manager を IDE から使わない**: `~/.cursor/mcp.json` から `**aem-cloudmanager` エントリを外す**と、パイプライン／環境系の誤操作経路がなくなる（必要なときだけ一時追加）。
- **ツールの自動承認を絶対に頼らない**: 更新・削除・公開は都度確認する（公式も「人間の監視」を推奨）。
- このリポジトリでは `**.cursor/rules/aem-mcp-demo-scope.mdc`** でエージェント向けにデモ Author とコンテンツパスのガードレールを置いている（法的・技術的強制ではなく補助）。

### 4. さらに厳しくする場合

- **デモ専用の Adobe ID** を別にし、その IMS ユーザーだけをサンドボックスプログラムとデモ AEM に招待する（他環境には参加させない）。

---

## Available Blocks

See [README.md](./README.md) for the full list of available blocks (Boilerplate + Block Collection).

All blocks are registered in the Universal Editor component palette via:

- `component-definition.json` — block palette entries
- `component-models.json` — block property panels
- `component-filters.json` — placement rules

Each Block Collection block also has a distributed `_blockname.json` config in its folder.