import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Pricing Cards block.
 *
 * One row per plan; cell order matches the pricing-card model fields:
 *   1) plan name
 *   2) price
 *   3) period
 *   4) description
 *   5) features (richtext list)
 *   6) featured flag (yes / true / featured / 1 — empty = standard)
 *   7) cta link
 *   8) cta label
 * Empty cells are tolerated.
 */

const FEATURED_VALUES = new Set(['yes', 'true', 'featured', '1']);

function textOf(cell) {
  return cell?.textContent.trim() ?? '';
}

function isFeatured(cell) {
  return FEATURED_VALUES.has(textOf(cell).toLowerCase());
}

function buildPlan(row) {
  const cells = [...row.children];
  const [
    nameCell,
    priceCell,
    periodCell,
    descCell,
    featuresCell,
    featuredCell,
    ctaLinkCell,
    ctaLabelCell,
  ] = cells;

  const li = document.createElement('li');
  li.className = 'pricing-card';
  moveInstrumentation(row, li);
  if (featuredCell && isFeatured(featuredCell)) li.classList.add('pricing-card-featured');

  const name = textOf(nameCell);
  if (name) {
    const tag = document.createElement('p');
    tag.className = 'pricing-card-tag';
    tag.textContent = name;
    li.append(tag);
  }

  const priceText = textOf(priceCell);
  const periodText = textOf(periodCell);
  if (priceText || periodText) {
    const price = document.createElement('p');
    price.className = 'pricing-card-price';
    if (priceText) {
      const strong = document.createElement('strong');
      strong.textContent = priceText;
      price.append(strong);
    }
    if (periodText) {
      const span = document.createElement('span');
      span.textContent = ` ${periodText}`;
      price.append(span);
    }
    li.append(price);
  }

  const desc = textOf(descCell);
  if (desc) {
    const p = document.createElement('p');
    p.className = 'pricing-card-desc';
    p.textContent = desc;
    li.append(p);
  }

  if (featuresCell) {
    const list = featuresCell.querySelector('ul, ol');
    if (list) {
      list.classList.add('pricing-card-features');
      li.append(list);
    } else {
      const text = textOf(featuresCell);
      if (text) {
        const ul = document.createElement('ul');
        ul.className = 'pricing-card-features';
        text.split(/\n|·|・|, /).map((s) => s.trim()).filter(Boolean).forEach((item) => {
          const liItem = document.createElement('li');
          liItem.textContent = item;
          ul.append(liItem);
        });
        if (ul.children.length) li.append(ul);
      }
    }
  }

  const link = ctaLinkCell?.querySelector('a');
  const label = textOf(ctaLabelCell);
  if (link) {
    const a = link.cloneNode(true);
    if (label) a.textContent = label;
    a.classList.add('button');
    a.classList.add(li.classList.contains('pricing-card-featured') ? 'primary' : 'secondary');
    const wrap = document.createElement('p');
    wrap.className = 'button-container pricing-card-cta';
    wrap.append(a);
    li.append(wrap);
  }

  return li;
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'pricing-cards-list';

  [...block.children].forEach((row) => {
    if (row.tagName !== 'DIV') return;
    const plan = buildPlan(row);
    ul.append(plan);
  });

  block.replaceChildren(ul);
}
