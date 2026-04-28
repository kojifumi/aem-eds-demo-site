# AEM EDS Demo Site — Setup Guide

This guide covers all the setup steps required after the GitHub repository has been created.

---

## Step 1: Install aem-code-sync (Human Action Required)

The aem-code-sync GitHub App connects this repository to AEM's content delivery pipeline.

> **Action required:**
>
> 1. Open: <https://github.com/apps/aem-code-sync/installations/new>
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

## Step 6: Verify Preview URL

After aem-code-sync is installed and the AEM site is created, the preview URL will be:
```
https://main--aem-eds-demo-site--kojifumi.aem.page/
```

---

## GitHub: `kojifumi` 名下にリポジトリを用意する

コードと `fstab.yaml` は **`kojifumi/aem-eds-demo-site`** を前提にしています。

1. [kojifumi](https://github.com/kojifumi/) でサインインし、**New repository** で `aem-eds-demo-site` を作成する（private 可）。
2. ローカルでリモートを設定してプッシュする:

```bash
cd /Users/fkojima/dev/eds/aem-eds-demo-site
git remote set-url origin https://github.com/kojifumi/aem-eds-demo-site.git
git push -u origin main
```

別アカウント（例: Enterprise Managed User）からは `kojifumi` 側にリポジトリを自動作成できない場合があります。そのときは上記の手動作成とプッシュで問題ありません。

以前 **`fkojima_adobe/aem-eds-demo-site`** にだけあった場合は、GitHub の **Transfer ownership** で `kojifumi` に移すか、移行後に旧リポジトリをアーカイブしてください。

---

## Available Blocks

See [README.md](./README.md) for the full list of available blocks (Boilerplate + Block Collection).

All blocks are registered in the Universal Editor component palette via:
- `component-definition.json` — block palette entries
- `component-models.json` — block property panels
- `component-filters.json` — placement rules

Each Block Collection block also has a distributed `_blockname.json` config in its folder.
