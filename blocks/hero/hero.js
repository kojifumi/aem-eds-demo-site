/**
 * Hero (Gradient) decoration for UE-authored multi-row structure.
 * UE outputs each field as its own row — not as siblings inside one cell.
 */

export default function decorate(block) {
  const isGradient = block.classList.contains('gradient')
    || block.classList.contains('hero-gradient');
  if (!isGradient) return;

  block.classList.add('gradient');

  const h1 = block.querySelector('h1, h2');
  if (!h1) return;

  // Eyebrow: short paragraph before the headline
  const eyebrow = [...block.querySelectorAll('p')].find((p) => {
    if (p.classList.contains('button-container') || p.querySelector('a')) return false;
    const text = p.textContent.trim();
    if (!text || text.length > 80) return false;
    return (p.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
  });
  if (eyebrow) eyebrow.classList.add('hero-eyebrow');

  // Headline highlight: duplicate short line from titleHighlight field
  const highlightP = [...block.querySelectorAll('p')].find((p) => {
    if (p === eyebrow || p.classList.contains('button-container') || p.querySelector('a')) {
      return false;
    }
    const text = p.textContent.trim();
    const heading = h1.textContent.trim();
    if (!text || text.length > 80) return false;
    return heading.includes(text) && text !== heading;
  });

  if (highlightP) {
    const highlightText = highlightP.textContent.trim();
    if (h1.textContent.includes(highlightText)) {
      wrapHighlightInHeading(h1, highlightText);
    } else {
      insertHighlightIntoHeading(h1, highlightText);
    }
    highlightP.remove();
  }

  groupCtaButtons(block);
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

/** Headline without highlight text; highlight comes from its own field. */
function insertHighlightIntoHeading(heading, highlightText) {
  const text = heading.textContent.trim();
  heading.textContent = '';

  const em = document.createElement('em');
  em.textContent = highlightText;

  if (text.includes('That ') && text.includes('Forward')) {
    const before = text.slice(0, text.indexOf('That ') + 5);
    const after = text.slice(text.indexOf('Forward'));
    heading.append(document.createTextNode(before));
    heading.append(em);
    heading.append(document.createTextNode(after));
    return;
  }

  heading.append(document.createTextNode(text.replace(highlightText, '').trim()));
  heading.append(document.createTextNode(' '));
  heading.append(em);
}

function groupCtaButtons(block) {
  const buttons = [...block.querySelectorAll('p.button-container')];
  if (buttons.length < 2) return;

  let wrapper = block.querySelector('.hero-ctas');
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.className = 'hero-ctas';
    buttons[0].before(wrapper);
  }

  buttons.forEach((btn) => wrapper.append(btn));
}
