import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Pricing Cards — UE row layout (1 row = 1 plan, fixed column order):
 *   name | price | period | description | features | featured | cta link | cta label
 *
 * Empty leading cells (e.g. missing Plan name) are omitted from plain.html — always fill Plan name.
 * Period must not start with "/" alone (/月 → link with garbled %E6%9C%88 text).
 */

const FEATURED_VALUES = new Set(['yes', 'true', 'featured', '1']);

function safeDecode(value) {
  if (!value || !value.includes('%')) return value;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function textOf(cell) {
  return cell?.textContent.trim() ?? '';
}

function looksLikePrice(text) {
  if (!text) return false;
  return /^custom$/i.test(text) || /^[$¥€£]/.test(text) || /^\d[\d,.]*$/.test(text);
}

function looksLikePlanName(text) {
  if (!text) return false;
  return /^[A-Za-z][A-Za-z0-9\s-]{0,30}$/.test(text) && !looksLikePrice(text);
}

function isPeriodLink(anchor) {
  if (!anchor) return false;
  const text = safeDecode(anchor.textContent.trim());
  const href = safeDecode((anchor.getAttribute('href') || '').trim());
  if (/(signup|contact|products|pricing|about)/i.test(href)) return false;
  if (/^(月|年)$/i.test(text)) return true;
  if (/^\/(\s*mo|\s*yr)/i.test(text)) return true;
  if (/月|\/\s*mo|\/\s*yr|per month/i.test(text)) return true;
  if (/月|\/\s*mo|\/\s*yr|年/.test(href)) return true;
  if (href.startsWith('/') && text.length <= 12 && /%E6%9C%88|月|mo|yr/i.test(`${text}${href}`)) {
    return true;
  }
  return false;
}

function periodFromCell(cell) {
  if (!cell) return '';
  const anchor = cell.querySelector(':scope a[href]');
  if (!anchor) return textOf(cell);

  const href = safeDecode(anchor.getAttribute('href') || '');
  const text = safeDecode(anchor.textContent.trim());

  if (!isPeriodLink(anchor)) return text;

  if (/月/.test(href)) return '月';
  if (/\/\s*mo/i.test(href) || /\/\s*mo/i.test(text)) return '/ mo';
  if (/\/\s*yr/i.test(href) || /\/\s*yr/i.test(text)) return '/ yr';

  const fromHref = href.replace(/^\//, '');
  if (fromHref && !fromHref.includes('%')) return fromHref;

  return text.replace(/^\//, '').replace(/\/%E6%9C%88/gi, '月');
}

function isFeatured(cell) {
  return FEATURED_VALUES.has(textOf(cell).toLowerCase());
}

function rowHasContent(cells) {
  return cells.some((cell) => textOf(cell) || cell.querySelector('ul, ol, a[href]'));
}

function resolveFieldIndices(cells) {
  const firstText = textOf(cells[0]);
  const nameMissing = cells.length > 0
    && !looksLikePlanName(firstText)
    && looksLikePrice(firstText);
  const offset = nameMissing ? -1 : 0;

  return {
    name: offset >= 0 ? 0 : -1,
    price: 1 + offset,
    period: 2 + offset,
    description: 3 + offset,
    features: 4 + offset,
    featured: 5 + offset,
    ctaLink: 6 + offset,
    ctaLabel: 7 + offset,
  };
}

function getCell(cells, index) {
  return index >= 0 && index < cells.length ? cells[index] : null;
}

function findCta(cells, indices) {
  const linkCell = getCell(cells, indices.ctaLink);
  const labelCell = getCell(cells, indices.ctaLabel);
  const anchor = linkCell?.querySelector(':scope a[href]');
  if (!anchor || isPeriodLink(anchor)) return null;

  const label = textOf(labelCell);
  return {
    anchor,
    label: label || anchor.textContent.trim(),
  };
}

function buildPlan(row) {
  const cells = [...row.children].filter((child) => child.tagName === 'DIV');
  if (!rowHasContent(cells)) return null;

  const indices = resolveFieldIndices(cells);
  const nameCell = getCell(cells, indices.name);
  const priceCell = getCell(cells, indices.price);
  const periodCell = getCell(cells, indices.period);
  const descCell = getCell(cells, indices.description);
  const featuresCell = getCell(cells, indices.features);
  const featuredCell = getCell(cells, indices.featured);
  const cta = findCta(cells, indices);

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
  const periodText = periodFromCell(periodCell);
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
      span.textContent = periodText.startsWith(' ') ? periodText : ` ${periodText}`;
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
        text.split(/\n|·|・|\s+\/\s+/).map((s) => s.trim()).filter(Boolean).forEach((item) => {
          const liItem = document.createElement('li');
          liItem.textContent = item;
          ul.append(liItem);
        });
        if (ul.children.length) li.append(ul);
      }
    }
  }

  if (cta?.anchor) {
    const a = cta.anchor.cloneNode(true);
    if (cta.label) a.textContent = cta.label;
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
    if (plan) ul.append(plan);
  });

  block.replaceChildren(ul);
}
