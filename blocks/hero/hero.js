/**
 * Hero block decoration.
 * Supports UE-authored fields (title, titleHighlight, CTA link fields) — not strong/em markup.
 */
export default function decorate(block) {
  if (!block.classList.contains('gradient')) return;

  const h1 = block.querySelector('h1');
  if (h1) {
    const highlightSource = findHighlightParagraph(h1);
    if (highlightSource) {
      wrapHighlightInHeading(h1, highlightSource.textContent.trim());
      highlightSource.remove();
    }

    const eyebrow = h1.previousElementSibling;
    if (eyebrow?.tagName === 'P' && !eyebrow.classList.contains('button-container') && !eyebrow.querySelector('a')) {
      eyebrow.classList.add('hero-eyebrow');
    }
  }
}

/**
 * UE outputs titleHighlight as a paragraph after the headline.
 */
function findHighlightParagraph(h1) {
  let node = h1.nextElementSibling;
  while (node) {
    if (node.tagName === 'P' && !node.classList.contains('button-container') && !node.querySelector('a')) {
      const text = node.textContent.trim();
      if (text && text.length < 60 && h1.textContent.includes(text)) {
        return node;
      }
    }
    if (node.tagName === 'H1' || node.tagName === 'H2') break;
    node = node.nextElementSibling;
  }
  return null;
}

function wrapHighlightInHeading(heading, highlightText) {
  const full = heading.textContent;
  const start = full.indexOf(highlightText);
  if (start < 0) return;

  const before = full.slice(0, start);
  const after = full.slice(start + highlightText.length);
  heading.textContent = '';
  if (before) heading.append(document.createTextNode(before));
  const em = document.createElement('em');
  em.textContent = highlightText;
  heading.append(em);
  if (after) heading.append(document.createTextNode(after));
}
