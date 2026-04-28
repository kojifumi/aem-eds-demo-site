# AEM EDS Demo Site

AEM Edge Delivery Services demo site with Universal Editor authoring.

## Setup

- **GitHub repo**: `kojifumi/aem-eds-demo-site`
- **AEM Author**: `https://author-p159404-e1696482.adobeaemcloud.com`
- **Template**: `adobe-rnd/aem-boilerplate-xwalk`

## Available Blocks

### Boilerplate Blocks
- **Hero** — Hero image and text at the top of a page
- **Cards** — Grid of image + text cards
- **Columns** — Multi-column layout
- **Fragment** — Reuse content across pages
- **Header** — Site navigation
- **Footer** — Site footer

### Block Collection Blocks
- **Accordion** — Collapsible content sections
- **Carousel** — Slideshow with multiple slides
- **Embed** — Embed YouTube, Vimeo, or other URLs
- **Modal** — Overlay dialogs (triggered by `/modals/` links)
- **Quote** — Pull quote with attribution
- **Search** — Site search
- **Table** — Tabular data
- **Tabs** — Tabbed content panels
- **Video** — Video playback

## Local Development

```bash
npm install
aem up
```

## Configuration

- `fstab.yaml` — Content source (AEM Author)
- `paths.json` — AEM content path to URL mapping
- `component-definition.json` — Universal Editor block palette
- `component-models.json` — Universal Editor block property panels
- `component-filters.json` — Universal Editor placement rules

## References

- [AEM Edge Delivery Services + Universal Editor tutorial](https://experienceleague.adobe.com/en/docs/experience-manager-learn/sites/edge-delivery-services/developing/universal-editor/0-overview)
- [aem-boilerplate-xwalk](https://github.com/adobe-rnd/aem-boilerplate-xwalk)
- [Block Collection](https://www.aem.live/developer/block-collection)
