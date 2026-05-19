function formatTestimonialAttribution(attributionEl) {
  const text = attributionEl.textContent.trim().replace(/^—\s*/, '');
  const commaIndex = text.indexOf(',');
  if (commaIndex < 0) return false;

  const name = text.slice(0, commaIndex).trim();
  const role = text.slice(commaIndex + 1).trim();
  if (!name || !role) return false;

  attributionEl.textContent = '';
  attributionEl.classList.add('testimonial-attribution');

  const nameSpan = document.createElement('span');
  nameSpan.className = 'testimonial-name';
  nameSpan.textContent = name;

  const roleSpan = document.createElement('span');
  roleSpan.className = 'testimonial-role';
  roleSpan.textContent = role;

  attributionEl.append(nameSpan, roleSpan);
  return true;
}

function readAttribution(attributionEl) {
  if (!attributionEl) return null;

  const name = attributionEl.querySelector('.testimonial-name');
  if (name) {
    const role = attributionEl.querySelector('.testimonial-role')?.textContent?.trim() ?? '';
    const p = document.createElement('p');
    p.textContent = role ? `${name.textContent.trim()}, ${role}` : name.textContent.trim();
    return p;
  }

  const p = document.createElement('p');
  p.textContent = attributionEl.textContent.trim().replace(/^—\s*/, '');
  return p;
}

function readQuotation(quotationEl) {
  if (!quotationEl) return null;
  const p = document.createElement('div');
  p.append(...quotationEl.childNodes.length ? [...quotationEl.childNodes] : []);
  if (!p.textContent.trim()) p.textContent = quotationEl.textContent.trim();
  return p;
}

export default async function decorate(block) {
  const section = block.closest('.section');
  const isTestimonial = section?.classList.contains('testimonial');

  const blockquote = block.querySelector(':scope > blockquote');
  const quotation = blockquote
    ? readQuotation(blockquote.querySelector('.quote-quotation'))
    : block.children[0]?.firstElementChild;
  const attribution = blockquote
    ? readAttribution(blockquote.querySelector('.quote-attribution'))
    : block.children[1]?.firstElementChild;

  if (!quotation) return;

  const newBlockquote = document.createElement('blockquote');
  quotation.className = 'quote-quotation';
  if (isTestimonial) quotation.classList.add('testimonial-quote');
  newBlockquote.append(quotation);

  if (attribution) {
    attribution.className = 'quote-attribution';
    newBlockquote.append(attribution);

    if (!(isTestimonial && formatTestimonialAttribution(attribution))) {
      attribution.querySelectorAll('em').forEach((em) => {
        const cite = document.createElement('cite');
        cite.innerHTML = em.innerHTML;
        em.replaceWith(cite);
      });
    }
  }

  block.replaceChildren(newBlockquote);
}
