# AEM EDS Demo Site (Nexara AI)

AEM Edge Delivery Services demo site with Universal Editor authoring. Design and page recipes are based on **`mockups/`**; see **[SETUP.md](./SETUP.md)** for full setup and authoring steps.

## Environments

| | |
|---|---|
| **GitHub** | [kojifumi/aem-eds-demo-site](https://github.com/kojifumi/aem-eds-demo-site) |
| **Preview** | https://main--aem-eds-demo-site--kojifumi.aem.page/ |
| **AEM Author** | https://author-p159404-e1696482.adobeaemcloud.com |
| **Template** | [adobe-rnd/aem-boilerplate-xwalk](https://github.com/adobe-rnd/aem-boilerplate-xwalk) |

Japanese pages use `/ja/…`. Global fragments **`/nav`** and **`/footer`** live at the site root (not `/ja/nav`).

---

## Available blocks (Universal Editor palette)

Source of truth: `component-definition.json` (run `npm run build:json` after editing `models/`).

### Default content

Text, Title, Image, Button

### Custom (Nexara)

| Block | Notes |
|-------|--------|
| **Hero (Gradient)** | Default gradient hero |
| **Hero (Gradient, Compact)** | Product pages (`hero-gradient-compact`) |
| **Hero (Gradient, With Image)** | About-style hero with media (`hero-gradient-with-image`) |
| **Timeline** / Timeline Item | Milestones (About 沿革) |
| **Pricing Cards** / Pricing Card | Pricing tiers |
| **Columns (3)** | Three-column layout (`columns-3`, e.g. stats row) |

### Boilerplate (in palette)

| Block | Notes |
|-------|--------|
| **Hero** | Standard image hero |
| **Cards** / Card | Image + text grid |
| **Columns** | Two-column layout |
| **Fragment** | Include `/nav`, `/footer`, or other pages |

### Block Collection (in palette)

Accordion, Carousel, Embed, Quote, Search, Table, Tabs, Video

### Site chrome (code-only, not in UE palette)

**Header** and **Footer** load **`/nav`** and **`/footer`** fragments. Author those pages in UE; reference **`nav.plain.html`** and **`footer.plain.html`** at the repo root.

**Modal** is available in code (Block Collection pattern) but is not registered in the UE component definition for this site.

---

## Section styles

Set via Section metadata → **Style** (multiselect). Defined in `models/_section.json`, styled in `styles/styles.css`.

Examples: `prose`, `soft`, `stats`, `values`, `history`, `leadership`, `how-it-works`, `testimonial`, `cta-banner`, `related`, `faq`, `highlight`, and others.

---

## Authoring references

| Page | Reference file |
|------|----------------|
| Nav (`/nav`) | `nav.plain.html` |
| Footer (`/footer`) | `footer.plain.html` |
| Home | `mockups/index.plain.html` |
| NexaPredict | `mockups/products-nexapredict.plain.html` |
| About | `mockups/about.plain.html` |
| Visual mockups | `mockups/*.html` |

After Publish, confirm fragments: `…/nav.plain.html`, `…/footer.plain.html`.

---

## Local development

```bash
npm install
npm run build:json   # after UE model changes
aem up
# optional: aem up --url https://main--aem-eds-demo-site--kojifumi.aem.page
npm run lint
```

---

## Configuration

- `fstab.yaml` — Content source (AEM Author)
- `paths.json` — AEM content path → URL mapping
- `models/_component-*.json` — UE model sources
- `component-definition.json`, `component-models.json`, `component-filters.json` — generated UE config

---

## References

- [SETUP.md](./SETUP.md) — aem-code-sync, site creation, page recipes
- [AGENTS.md](./AGENTS.md) — contributor / agent guidelines
- [AEM EDS + Universal Editor tutorial](https://experienceleague.adobe.com/en/docs/experience-manager-learn/sites/edge-delivery-services/developing/universal-editor/0-overview)
- [aem-boilerplate-xwalk](https://github.com/adobe-rnd/aem-boilerplate-xwalk)
- [Block Collection](https://www.aem.live/developer/block-collection)
