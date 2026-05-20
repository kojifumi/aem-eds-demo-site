import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Timeline block
 *
 * UE row layout (1 row = 1 milestone — see _timeline.json#item):
 *   year | title | description
 *
 * Authoring example:
 *   | timeline |
 *   | 2019 | 創業 | サンフランシスコで Nexara AI 設立。 |
 *   | 2024 | グローバル展開 | APAC・EMEA オフィス開設。 |
 */

function textOf(cell) {
  return cell?.textContent.trim() ?? '';
}

function buildItem(row) {
  const cells = [...row.children];
  const [yearCell, titleCell, descCell] = cells;

  const li = document.createElement('li');
  li.className = 'timeline-item';
  moveInstrumentation(row, li);

  const year = textOf(yearCell);
  if (year) {
    const span = document.createElement('span');
    span.className = 'timeline-year';
    span.textContent = year;
    li.append(span);
  }

  const heading = titleCell?.querySelector('h2, h3, h4, h5, h6');
  const title = heading ? heading.textContent.trim() : textOf(titleCell);
  if (title) {
    const h = document.createElement('h3');
    h.className = 'timeline-title';
    h.textContent = title;
    li.append(h);
  }

  if (descCell) {
    const ps = [...descCell.querySelectorAll('p')];
    if (ps.length) {
      ps.forEach((p) => {
        p.classList.add('timeline-desc');
        li.append(p);
      });
    } else {
      const text = textOf(descCell);
      if (text) {
        const p = document.createElement('p');
        p.className = 'timeline-desc';
        p.textContent = text;
        li.append(p);
      }
    }
  }

  return li;
}

export default function decorate(block) {
  const ol = document.createElement('ol');
  ol.className = 'timeline-list';

  [...block.children].forEach((row) => {
    if (row.tagName !== 'DIV') return;
    ol.append(buildItem(row));
  });

  block.replaceChildren(ol);
}
