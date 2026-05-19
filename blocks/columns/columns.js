function decorateHowItWorksSteps(block) {
  const row = block.firstElementChild;
  if (!row) return;

  const cells = [...row.children];
  if (cells.length !== 3) return;

  let stepCount = 0;
  cells.forEach((cell) => {
    if (cell.querySelector(':scope > .step-number')) return;

    let stepEl = cell.querySelector(':scope > p:has(+ :is(h1, h2, h3, h4))');
    if (!stepEl) {
      const firstP = cell.querySelector(':scope > p');
      const text = firstP?.textContent?.trim() ?? '';
      if (/^\d{1,2}$/.test(text)) stepEl = firstP;
    }
    if (!stepEl) {
      const divText = cell.querySelector(':scope > div:not(:has(p))')?.textContent?.trim()
        ?? cell.children[0]?.textContent?.trim();
      if (/^\d{1,2}$/.test(divText ?? '')) {
        const wrapper = cell.querySelector(':scope > div') || cell;
        stepEl = document.createElement('p');
        stepEl.className = 'step-number';
        stepEl.textContent = divText;
        const heading = cell.querySelector(':scope > :is(h1, h2, h3, h4)');
        if (heading) {
          cell.insertBefore(stepEl, heading);
        } else {
          cell.prepend(stepEl);
        }
        stepCount += 1;
        return;
      }
    }
    if (stepEl) {
      stepEl.classList.add('step-number');
      stepCount += 1;
    }
  });

  if (stepCount >= 2) {
    block.classList.add('how-it-works-steps');
    block.closest('.section')?.classList.add('how-it-works');
  }
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);
  decorateHowItWorksSteps(block);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}
